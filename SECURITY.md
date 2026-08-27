# Security & Access Control Architecture — STY. J Nexus

## 1. Threat Model & Overview
STY. J Nexus operates as a high-conversion e-commerce storefront for premium electronics in Ghana. This document specifies the security controls implemented to protect customer data, prevent scraping, avoid Insecure Direct Object References (IDOR), and safeguard administrative interfaces.

---

## 2. Insecure Direct Object Reference (IDOR) Mitigation

### The Risk:
In typical web applications, an order confirmation screen might load data from a query parameter, e.g.:
https://example.com/order-success.html?orderId=12345
If authorization checks are missing, an attacker could enumerate ?orderId=12344, ?orderId=12343, etc., viewing customer names, phone numbers, delivery locations, and purchased products.

### STY. J Nexus Implementation & Defense:
1. **No URL-Based Order Retrieval**:
   - order-success.html **never** reads an order ID or details from the URL query string.
   - It reads strictly from the browser's ephemeral sessionStorage.getItem('order_success').
2. **Session Isolation**:
   - If anyone accesses order-success.html directly or supplies malicious query parameters (?id=ORD-...), no database request is made.
   - The page displays: *"No Active Order Found. You haven't placed an order recently in this browser session."*
   - It is technically impossible for an external visitor to scrape or view another customer's order through the confirmation page.

---

## 3. Database (Firebase Firestore) Access Control

The repository contains irestore.rules enforcing principle of least privilege:

`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      // Prospective customers can ONLY create order documents
      allow create: if request.resource.data.keys().hasAll(['name', 'phone', 'items', 'total'])
                    && request.resource.data.name is string
                    && request.resource.data.phone is string;
      // Reading, updating, or deleting existing orders is strictly blocked for unauthenticated users
      allow read, update, delete: if request.auth != null;
    }
  }
}
`

- **Write-Only for Customers**: The storefront can submit orders, but cannot list, search, or view existing orders in Firestore.
- **Preventing Console Scraping**: Even if an attacker executes irebase.firestore().collection('orders').get() in browser DevTools, Firestore rejects the request with a permission denied error.

---

## 4. Admin Portal Access & Hardening

1. **No Public Discovery**:
   - The Store Admin link is completely removed from customer-facing navigation and footers.
   - dmin/index.html includes <meta name="robots" content="noindex, nofollow"/> to prevent indexing by search engines.
2. **Cryptographic Authentication**:
   - Admin credentials are verified against a SHA-256 hash using the Web Crypto API (crypto.subtle.digest). Plaintext passwords are never stored in client code.
3. **Brute Force Lockout**:
   - Failed login attempts are throttled. After 5 consecutive invalid passwords, the interface enforces a 60-second lockout period.
4. **Session Management**:
   - Authentication tokens are maintained in sessionStorage and automatically terminated when the admin logs out or closes their browser session.

---

## 5. Deployment & Domain Security

- **Hosting**: Static delivery via GitHub Pages with HTTPS enforced.
- **DNS**: Porkbun DNS configured with DNSSEC and registrar locking.
- **Zero Secrets in Repository**: No private backend keys or database secrets are committed to version control.
