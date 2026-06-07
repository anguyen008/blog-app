# Password security utilities - critical for backend development
# Always hash passwords (one-way) instead of encrypting (two-way)

from pwdlib import PasswordHash

# Use recommended algorithm (currently Argon2) - resistant to brute-force attacks
password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """
    Hash password for storage. One-way operation: impossible to reverse.
    Never store plain-text passwords.
    """
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """
    Compare plain-text password with stored hash. Uses constant-time comparison
    to prevent timing attacks. Returns True if password matches hash.
    """
    return password_hasher.verify(password, password_hash)
