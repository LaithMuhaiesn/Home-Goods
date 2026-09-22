# Cart and Checkout

| | |
|---|---|
| **Slug** | `cart-and-checkout` |
| **Branch** | `claude/feature/cart-and-checkout` |
| **Status** | Ready |
| **Created** | 2026-09-22 |
| **Authored with** | ChatGPT (web), 1 round, from a Claude Code draft |

## 1. Summary

Allow a shopper to collect products in a browser-based cart, review and modify the cart, provide contact and delivery details, and submit the cart as an order.

The store accepts **EUR only**. There is **no payment provider and no payment processing**.

When the shopper submits the checkout, the server validates the cart against the current catalogue, calculates the authoritative prices and totals, and returns a confirmation result. The confirmation displays what was submitted.

No order is persisted. The confirmation exists only as the result of the current checkout flow.

---

## 2. Problem

The storefront currently presents products but does not provide a complete purchase-intent flow.

The feature must allow a shopper to:

* collect multiple products;
* review the selected products and total;
* correct quantities or remove products;
* provide the information required for delivery;
* submit the selection;
* receive a confirmation showing exactly what was submitted.

---

## 3. Goals

* Add a product to the browser cart from its product page.
* Show the current cart item count in a persistent storefront location.
* Review the cart on a dedicated cart page.
* Display each cart line with product, unit price, quantity, and line total.
* Display the cart grand total in EUR.
* Change quantities and remove cart lines.
* Empty the cart.
* Preserve the cart across a browser page reload.
* Collect the shopper's name, email, and delivery address.
* Validate the cart and checkout details before accepting the order submission.
* Recalculate all product prices and totals from the catalogue on the server.
* Show a confirmation containing the generated order identifier, submitted line items, and authoritative total.
* Clear the browser cart after a successful order submission.

---

## 4. Non-goals

The feature does **not**:

* process, authorize, capture, refund, or otherwise handle payments;
* integrate with a payment provider;
* collect or store card or payment credentials;
* create user accounts or require authentication;
* synchronize carts between browsers or devices;
* persist orders;
* provide order history;
* provide a way to retrieve a previous order after the current confirmation flow is lost;
* manage inventory or stock availability;
* reserve inventory;
* calculate or apply taxes;
* calculate shipping costs;
* apply discounts or coupons;
* support multiple currencies;
* allow product quantities to be changed from the product detail page;
* provide checkout quantity editing independently of the cart;
* send order emails or notifications;
* provide order management for staff or administrators.

The absence of order persistence means that an order confirmation is **not an order-history record** and cannot be reconstructed later from an order ID.

---

## 5. User Stories

* As a shopper, I want to add products to my cart so that I can collect multiple products before submitting my order.
* As a shopper, I want to see my cart count while browsing so that I know what is currently selected.
* As a shopper, I want to review products, quantities, and totals before checkout so that I can correct mistakes.
* As a shopper, I want my cart to survive a page reload so that an accidental reload does not remove my selection.
* As a shopper, I want to provide my contact and delivery information so that the storefront can submit my order.
* As a shopper, I want a confirmation showing what I submitted so that I can verify the result.

---

## 6. User Experience

### Entry Points

Every product detail page provides an **Add to cart** action.

The storefront provides a persistent cart indicator showing the current **total quantity of products in the cart**. The indicator links to the cart page.

The cart page is the only entry point to checkout.

Checkout is unavailable when the cart contains no products.

### Main Flow

1. The shopper selects **Add to cart** on a product.
2. The product is added to the browser cart.
3. If the product is already present, its quantity increases rather than creating another line.
4. The cart indicator immediately reflects the new total quantity.
5. The shopper opens the cart.
6. The cart displays every selected product, its current catalogue price, quantity, line total, and the grand total.
7. The shopper may change quantities, remove lines, or empty the cart.
8. The shopper proceeds to checkout while the cart contains at least one valid line.
9. The shopper enters name, email, and delivery address.
10. The shopper submits the order.
11. The server validates the cart and checkout details and calculates prices and totals from the catalogue.
12. If validation succeeds, the shopper is shown a confirmation containing the order ID, validated line items, and total.
13. The browser cart is cleared only after the order submission succeeds.

A failed submission does **not** clear the cart.

---

## 7. The Four States

The cart/checkout experience uses exactly four states:

| State       | Meaning                                                                    | Required behaviour                                                                                                                                                                    |
| ----------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading** | Required browser cart data or an order submission is still being resolved. | Do not display incomplete cart/order data as final. Show a meaningful loading state rather than only a bare spinner.                                                                  |
| **Empty**   | There is no cart content to act on.                                        | Explain that the cart is empty and provide a path back to shopping. Checkout cannot be started.                                                                                       |
| **Error**   | The requested operation could not be completed.                            | Explain the failure in user-facing terms, preserve recoverable cart/checkout data, and provide a retry or return-to-cart path appropriate to the failure.                             |
| **Success** | The requested operation completed and the resulting data is valid.         | For the cart, show the populated cart and totals. For checkout, show the usable checkout form when the cart is valid. For confirmation, show the successfully submitted order result. |

### State rules

* A populated, valid cart is **Success**, not Empty.
* Checkout with a valid non-empty cart is **Success** until submission begins.
* Checkout submission changes to **Loading** while the submission is in progress.
* A failed submission changes to **Error** and does not clear the cart.
* A successful submission changes to **Success** on the confirmation screen and clears the browser cart.
* A confirmation cannot be recreated from an order ID after the confirmation data has been lost because orders are not persisted.
* An empty cart cannot enter checkout.
* Invalid cart data discovered during checkout submission results in **Error**, not confirmation.

---

## 8. Cart Behaviour

The cart contains only:

* product identifier;
* quantity.

Product names, prices, and other catalogue information are resolved from the current catalogue.

### Quantity rules

* Quantities are whole numbers.
* A valid cart quantity is at least 1.
* Adding an existing product increases its existing quantity.
* Setting a quantity below 1 removes that product from the cart.
* Removing a line takes effect immediately.
* No confirmation is required before removing a line.
* Emptying the cart removes all lines immediately.

### Totals

* Unit prices come from the catalogue.
* Line total = catalogue unit price × quantity.
* Grand total = sum of all line totals.
* All monetary values are displayed in EUR with exactly two decimal places.
* Client-side totals update immediately after cart changes.
* Server-side totals are authoritative at order submission.

---

## 9. Checkout

Checkout requires:

* full name;
* email address;
* delivery address.

All three fields are required.

Validation must reject:

* an empty name after trimming;
* an empty address after trimming;
* an email that does not have a valid email shape;
* an empty cart;
* an unknown product identifier;
* a quantity that is not a whole number of at least 1.

The shopper must receive a field-specific validation message for invalid checkout fields.

Checkout does not collect payment information.

---

## 10. Order Submission

Submitting checkout performs one server-side validation and calculation step.

The server must:

1. confirm that the cart contains at least one item;
2. confirm that every product identifier exists in the current catalogue;
3. confirm that every quantity is a whole number of at least 1;
4. validate the required shopper details;
5. obtain product names and prices from the catalogue;
6. calculate every line total;
7. calculate the grand total;
8. generate an order identifier for the current confirmation;
9. return the validated order summary.

Client-supplied prices, line totals, and grand totals are never authoritative.

The submitted contact and delivery information is used only for the current request and confirmation flow. It is not persisted as an order.

---

## 11. Successful Confirmation

A successful confirmation displays:

* the generated order ID;
* every submitted product;
* the validated quantity for every product;
* the authoritative unit price;
* every authoritative line total;
* the authoritative grand total in EUR.

The confirmation must represent the server-validated result, not values supplied by the browser.

The cart is cleared only after this successful result is received.

Because orders are not persisted, the confirmation is not a permanent record. Refreshing or revisiting the confirmation after its temporary confirmation data is no longer available does not retrieve the order from the server.

---

## 12. Errors

The checkout operation has these defined failure categories:

| Condition                                  | Code               | Result                                                                 |
| ------------------------------------------ | ------------------ | ---------------------------------------------------------------------- |
| Cart contains no items                     | `empty_cart`       | Submission rejected; shopper remains outside confirmation.             |
| Product identifier is not in the catalogue | `invalid_item`     | Submission rejected; shopper is directed back to the cart.             |
| Quantity is invalid                        | `invalid_quantity` | Submission rejected; shopper is directed back to correct the cart.     |
| Name, email, or address is invalid         | `invalid_details`  | Submission rejected; the relevant field displays its validation error. |
| Unexpected server failure                  | `unexpected`       | Submission rejected; shopper can retry without losing the cart.        |

All server failures use the storefront's existing error-response convention: `{ "error": { "code": "...", "message": "..." } }`.

A failed submission never clears the cart.

---

## 13. Data and Persistence

No database records are created.

The browser stores only the cart's product identifiers and quantities.

The catalogue remains the source of truth for:

* product existence;
* product names;
* product prices.

The server resolves these values again during order submission.

Orders, order history, checkout submissions, and shopper contact details are not persisted.

No feature in this scope depends on an order being retrievable after the current confirmation flow.

---

## 14. Security and Privacy

The storefront does not require authentication.

The browser must not be trusted for product prices or calculated totals.

The server determines the authoritative product prices and totals.

Checkout contact and delivery details are used for the current order-submission request and are not persisted or intentionally logged by this feature.

No payment credentials are collected.

---

## 15. Accessibility

* Changes to the cart item count are announced to assistive technology.
* Quantity controls have meaningful accessible labels.
* Remove and empty-cart controls have meaningful accessible labels.
* Every checkout input has a visible associated label.
* Validation errors are presented as text and associated with the relevant field.
* Loading, empty, error, and success states are understandable without relying solely on visual styling.
* The checkout cannot be submitted successfully while required fields are invalid.

---

## 16. Performance and Scale

The expected catalogue and cart are small.

The feature does not require:

* pagination;
* inventory synchronization;
* background processing;
* scheduled work;
* persistent order storage.

Cart operations and total calculations should complete immediately for the expected catalogue size.

---

## 17. Testing Requirements

The implementation must verify the following behaviours.

### Cart

* Adding a product creates a cart line.
* Adding the same product again increases its quantity.
* Updating a quantity changes the line total and grand total.
* Removing a line removes it from the cart.
* Emptying the cart removes all lines.
* Cart contents survive a browser page reload.
* A populated cart displays the correct quantities and totals.
* An empty cart prevents checkout.

### Checkout

* Valid name, email, address, and cart contents can be submitted.
* Missing or invalid checkout fields are rejected.
* An empty cart is rejected.
* Unknown products are rejected.
* Invalid quantities are rejected.
* Server totals are based on catalogue prices.
* Client-supplied prices cannot change the returned totals.
* A failed submission leaves the cart intact.
* A successful submission clears the cart.

### Confirmation

* A successful submission displays an order ID.
* The confirmation displays the server-validated lines and quantities.
* The confirmation displays server-calculated prices and totals.
* The displayed grand total equals the sum of the displayed line totals.
* No persisted order is required to produce the confirmation.

### Accessibility

* Cart-count changes are announced.
* Form errors are associated with their corresponding fields.
* Interactive controls have meaningful accessible names.

---

## 18. Acceptance Criteria

* [ ] Every product detail page provides an **Add to cart** action.
* [ ] Adding a product increases the cart's visible total item count.
* [ ] Adding the same product multiple times produces one cart line whose quantity increases accordingly.
* [ ] The cart indicator is available from every storefront page.
* [ ] The cart page displays every line's product, unit price, quantity, and line total.
* [ ] The cart displays a grand total.
* [ ] All displayed monetary values use EUR with exactly two decimal places.
* [ ] Changing a quantity immediately updates the affected line total and grand total.
* [ ] Setting a quantity below 1 removes the line.
* [ ] A shopper can remove a line without a confirmation prompt.
* [ ] A shopper can empty the entire cart.
* [ ] Cart contents survive a browser page reload.
* [ ] An empty cart displays an explicit empty state and a path back to shopping.
* [ ] Checkout cannot be started when the cart is empty.
* [ ] Checkout requires name, email, and delivery address.
* [ ] Invalid checkout fields prevent successful submission and display field-specific text errors.
* [ ] Checkout submission validates that every cart product exists in the current catalogue.
* [ ] Checkout submission validates that every quantity is a whole number of at least 1.
* [ ] Checkout submission calculates prices and totals from the server's catalogue data.
* [ ] Client-supplied prices or totals cannot alter the returned order totals.
* [ ] A successful submission returns a generated order ID.
* [ ] A successful confirmation displays the order ID, validated line items, quantities, prices, line totals, and grand total.
* [ ] The confirmation's grand total equals the sum of its displayed line totals.
* [ ] The browser cart is cleared only after a successful order submission.
* [ ] A failed order submission does not clear the cart.
* [ ] An invalid product results in an explicit invalid-item error and does not produce a confirmation.
* [ ] An invalid quantity results in an explicit invalid-quantity error and does not produce a confirmation.
* [ ] An unexpected server failure produces an error state with a retry path.
* [ ] All server failures use the existing storefront error-response convention.
* [ ] Loading, empty, error, and success states are explicitly represented and understandable.
* [ ] Cart-count changes are announced to assistive technology.
* [ ] Checkout fields have visible labels and associated validation messages.
* [ ] No payment information is collected or processed.
* [ ] No order or checkout submission is persisted.
* [ ] An order cannot be retrieved later using its order ID.

---

## 19. Decisions / Resolved Open Questions

The original open questions are resolved by this specification.

### Cart indicator location

**Decision:** The cart indicator is persistent and available from every storefront page.

**Reason:** The goals and user stories require the shopper to see the cart count while browsing. Restricting it to category/product pages would contradict that requirement.

### Remove confirmation

**Decision:** No confirmation is required before removing a line.

**Reason:** The interaction requirement explicitly permits immediate removal, and no undo mechanism is required.

### Confirmation URL accessibility

**Decision:** A confirmation is available only as part of the current successful checkout flow. An order ID is not sufficient to retrieve it later.

**Reason:** Orders are not persisted. Making the confirmation independently addressable by order ID would require persistent order data or another durable source of truth, which is outside this feature.

---

## 20. Explicitly Out of Scope

The following remain outside this feature:

* payment processing;
* card capture;
* payment providers;
* authentication and accounts;
* persistent orders;
* order history;
* stock and inventory;
* inventory reservation;
* taxes;
* shipping calculation;
* discounts;
* coupons;
* multiple currencies;
* order emails;
* customer notifications;
* staff/admin order management;
* cross-device cart synchronization;
* recovering a previous confirmation after the current confirmation data is lost.
