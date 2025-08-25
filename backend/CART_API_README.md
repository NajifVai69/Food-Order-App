# Cart API Usage Guide (Postman)

## Prerequisites
- Backend server running (default: http://localhost:5000)
- A registered and logged-in user (get JWT token or use cookie auth)

## Authentication
All cart endpoints require authentication. Use the JWT token in the `Authorization` header as `Bearer <token>`, or use cookies if your backend is set up for cookie-based auth.

---

## 1. Get Current User's Cart
**GET** `/api/cart`

- Returns the current user's cart (items, total, deliveryFee).

### Example Request
```
GET http://localhost:5000/api/cart
Headers:
  Authorization: Bearer <your_token>
```

---

## 2. Add or Update Item in Cart
**POST** `/api/cart/add`

**Body (JSON):**
```
{
  "menuItemId": "<menu_item_id>",
  "quantity": 2
}
```

- Adds the item to the cart or updates its quantity.

---

## 3. Remove Item from Cart
**POST** `/api/cart/remove`

**Body (JSON):**
```
{
  "menuItemId": "<menu_item_id>"
}
```

---

## 4. Clear Cart
**POST** `/api/cart/clear`

- Removes all items from the cart.

---

## 5. Add Menu Item (Owner Only)
**POST** `/api/restaurant-management/:restaurantId/menu-items`

**Body (JSON):**
```
{
  "name": "Fried Rice",
  "description": "Delicious fried rice with veggies",
  "price": 120,
  "category": "Chinese",
  "image": "https://example.com/image.jpg",
  "stock": 10
}
```

---

## 6. Update Menu Item (Owner Only)
**PUT** `/api/restaurant-management/:restaurantId/menu-items/:itemId`

**Body (JSON):**
```
{
  "name": "Fried Rice",
  "price": 130,
  "stock": 8
}
```

---

## Notes
- Replace `<your_token>`, `<menu_item_id>`, `<restaurantId>`, and `<itemId>` with actual values from your database.
- Use the login endpoint to get a JWT token if needed.
- All endpoints return JSON responses.

---

## Example Postman Steps
1. Login as a user/owner and copy the JWT token from the response.
2. For each request, set the `Authorization` header: `Bearer <your_token>`.
3. Use the above endpoints to test cart and menu item features.

---

For any issues, check your backend logs or API responses for error messages.
