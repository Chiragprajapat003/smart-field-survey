// Lightweight UTF-8 & Base64URL encoding helper for React Native & Web
function encodeBase64Url(stringData) {
  try {
    const jsonString = typeof stringData === "string" ? stringData : JSON.stringify(stringData);
    let base64 = "";
    if (typeof btoa === "function") {
      base64 = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } else {
      // Basic fallback
      base64 = Buffer.from(jsonString).toString("base64");
    }
    return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  } catch (e) {
    // Ultimate fallback for simple ASCII strings
    return strToBase64UrlFallback(JSON.stringify(stringData));
  }
}

function strToBase64UrlFallback(str) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let result = "";
  for (let i = 0; i < str.length; i += 3) {
    const a = str.charCodeAt(i);
    const b = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
    const c = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    result += chars[(bitmap >> 18) & 63];
    result += chars[(bitmap >> 12) & 63];
    result += i + 1 < str.length ? chars[(bitmap >> 6) & 63] : "";
    result += i + 2 < str.length ? chars[bitmap & 63] : "";
  }
  return result;
}

function decodeBase64Url(base64Url) {
  try {
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    let jsonString = "";
    if (typeof atob === "function") {
      jsonString = decodeURIComponent(
        Array.prototype.map
          .call(atob(base64), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } else {
      jsonString = Buffer.from(base64, "base64").toString("utf8");
    }
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn("JWT Base64 Decode Error", e);
    return null;
  }
}

// Simulated HMAC-SHA256 signature generator
function generateSignature(headerEncoded, payloadEncoded, secret = "GeoField_JWT_Secret_2026") {
  const input = `${headerEncoded}.${payloadEncoded}.${secret}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, "0") + "geofieldpro2026sig";
  return encodeBase64Url(hexHash);
}

/**
 * Generate a valid 3-part JSON Web Token string
 */
export function generateJwtToken(userPayload, expiresInHours = 24) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const nowInSec = Math.floor(Date.now() / 1000);
  const expInSec = nowInSec + expiresInHours * 3600;

  const payload = {
    sub: userPayload.id || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    email: userPayload.email || "inspector@geofield.com",
    name: userPayload.name || "Field Inspector",
    role: userPayload.role || "Lead Field Engineer",
    department: userPayload.department || "Civil Engineering",
    studentId: userPayload.studentId || "SURV-2026-88",
    institution: userPayload.institution || "GeoField Tech Institute",
    photoUri: userPayload.photoUri || null,
    avatarColor: userPayload.avatarColor || "#2563EB",
    iat: nowInSec,
    exp: expInSec,
    iss: "GeoField_Auth_Server",
  };

  const headerEncoded = encodeBase64Url(header);
  const payloadEncoded = encodeBase64Url(payload);
  const signature = generateSignature(headerEncoded, payloadEncoded);

  const jwtToken = `${headerEncoded}.${payloadEncoded}.${signature}`;
  return { token: jwtToken, payload };
}

/**
 * Decode 3-part JWT token into Header, Payload, Signature
 */
export function decodeJwtToken(jwtToken) {
  if (!jwtToken || typeof jwtToken !== "string") return null;
  const parts = jwtToken.split(".");
  if (parts.length !== 3) return null;

  const header = decodeBase64Url(parts[0]);
  const payload = decodeBase64Url(parts[1]);

  return {
    header,
    payload,
    signature: parts[2],
    rawToken: jwtToken,
  };
}

/**
 * Verify JWT structure and expiration
 */
export function verifyJwtToken(jwtToken) {
  const decoded = decodeJwtToken(jwtToken);
  if (!decoded || !decoded.payload) return { valid: false, reason: "Malformed token" };

  const nowInSec = Math.floor(Date.now() / 1000);
  if (decoded.payload.exp && decoded.payload.exp < nowInSec) {
    return { valid: false, reason: "Token expired", payload: decoded.payload };
  }

  return { valid: true, payload: decoded.payload };
}
