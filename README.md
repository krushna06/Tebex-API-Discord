# Tebexx-Discord
A discord bot that uses Tebexx Headless API.

## Todo:

### Webstore Commands
1. **`/webstore [identifier]`** - Fetch details about a specific webstore by its identifier.
2. **`/webstore-pages [identifier]`** - Retrieve custom pages associated with a specific store.

### Basket Commands
1. **`/basket [basket_id]`** - Fetch details of a specific basket by its identifier.
2. **`/new-basket`** - Create a new basket.
3. **`/auth-link [basket_id]`** - Get authentication links for a specific basket.

### Category Commands
1. **`/categories`** - Retrieve all categories available in the webstore.
2. **`/category-info [category_id]`** - Fetch details of a specific category.
3. **`/category-packages [category_id]`** - Get information about a specific category, including all packages within it.

### Package Commands
1. **`/packages`** - List all packages available in the webstore.
2. **`/package-info [package_id]`** - Fetch details of a specific package by its identifier.

### Creator Code Commands
1. **`/apply-creator-code [basket_id] [code]`** - Apply a creator code to a specific basket.
2. **`/remove-creator-code [basket_id]`** - Remove a creator code from the basket.

### Gift Card Commands
1. **`/apply-gift-card [basket_id] [card_code]`** - Apply a gift card to a specific basket.
2. **`/remove-gift-card [basket_id]`** - Remove a gift card from the basket.

### Coupon Commands
1. **`/apply-coupon [basket_id] [coupon_code]`** - Apply a coupon to a specific basket.
2. **`/remove-coupon [basket_id]`** - Remove a coupon from the basket.

### Package Management in Basket Commands
1. **`/add-package [basket_id] [package_id]`** - Add a package to a basket.
2. **`/remove-package [basket_id] [package_id]`** - Remove a package from a basket.

### Updating Package Quantity in Basket Command
1. **`/update-quantity [basket_id] [package_id] [quantity]`** - Update the quantity of a specific package in the basket.