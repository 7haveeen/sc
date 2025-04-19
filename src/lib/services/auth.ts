export async function passwordSignIn(params: {
  email: string;
  password: string;
}): Promise<Response> {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(params),
  });

  return response;
}

export async function auth2faOtp(params: { userId: string; code: string }): Promise<Response> {
  const response = await fetch("/api/auth/_2fa/otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(params),
  });

  return response;
}

export async function signOut(): Promise<Response> {
  const response = await fetch("/api/auth/signout", {
    method: "POST",
    credentials: "include",
  });

  return response;
}

export async function registerPasskey(params: {
  userId: string;
  name?: string;
  attestation_object: string;
  client_data_json: string;
  device_type: string;
  transports: string;
}): Promise<Response> {
  const response = await fetch("/api/auth/webauthn/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(params),
  });

  return response;
}

export async function signInWithPasskey(params: {
  authenticator_data: string;
  client_data_json: string;
  credential_id: string;
  signature: string;
  userAgent: string;
}): Promise<Response> {
  const response = await fetch("/api/auth/webauthn/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "user-agent": params.userAgent,
    },
    credentials: "include",
    body: JSON.stringify(params),
  });

  return response;
}

export async function createPasskeyChallenge(): Promise<Response> {
  const response = await fetch("/api/auth/webauthn/challenge", {
    method: "POST",
    credentials: "include",
  });

  return response;
}

export async function validateDomain(params: { email: string }): Promise<Response> {
  const response = await fetch("/api/auth/join/email/check/domain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(params),
  });

  return response;
}
