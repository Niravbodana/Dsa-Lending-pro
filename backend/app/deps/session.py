"""Shared session token extraction — prefer Authorization header over query string."""

from fastapi import Header, HTTPException, Query


def get_session_token(
    authorization: str | None = Header(None),
    session_token: str | None = Query(None),
) -> str:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        if token:
            return token
    if session_token:
        return session_token
    raise HTTPException(status_code=401, detail="Authentication required")
