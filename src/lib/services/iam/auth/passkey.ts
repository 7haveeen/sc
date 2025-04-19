import { decodeBase64, encodeBase64 } from "@oslojs/encoding";
import { ObjectParser } from "@pilcrowjs/object-parser";
import { createPasskeyChallenge } from "$lib/services/auth";

type CreatePasskeyCredentialOptions = {
  user: {
    userId: string;
    email?: string;
    username?: string;
  };
  credentialUserId: Uint8Array;
  existingCredentials?: Array<{ id: Uint8Array }>;
};

type PasskeyCredentialResult = {
  attestationObject: string;
  clientDataJSON: string;
  device_type: string;
  transports: string;
  error?: string;
};

export type PasskeySignInResult = {
  authenticatorData: string;
  clientDataJSON: string;
  credentialId: string;
  signature: string;
  error?: string;
};

async function handlePasskeyChallenge() {
  const response = await createPasskeyChallenge();
  if (!response.ok) {
    if (response.status === 429) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    else {
      throw new Error("Failed to get challenge");
    }
  }
  const result = await response.json();
  const parser = new ObjectParser(result);
  return decodeBase64(parser.getString("challenge"));
}

export async function createPasskeyCredential({
  user,
  credentialUserId,
  existingCredentials = [],
}: CreatePasskeyCredentialOptions): Promise<PasskeyCredentialResult> {
  try {
    const challenge = await handlePasskeyChallenge();

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        user: {
          displayName: user.username || "Default",
          id: credentialUserId,
          name: user.email || "user@example.com",
        },
        rp: {
          name: "7Haven",
        },
        pubKeyCredParams: [
          {
            alg: -7,
            type: "public-key",
          },
          {
            alg: -257,
            type: "public-key",
          },
        ],
        attestation: "none",
        authenticatorSelection: {
          userVerification: "required",
          residentKey: "required",
          requireResidentKey: true,
        },
        excludeCredentials: existingCredentials.map(credential => ({
          id: credential.id,
          type: "public-key",
        })),
      },
    });

    if (!(credential instanceof PublicKeyCredential)) {
      throw new TypeError("Failed to create public key");
    }

    if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
      throw new TypeError("Unexpected response");
    }

    const clientDataJSON = new Uint8Array(credential.response.clientDataJSON);
    const transports = credential.response.getTransports?.() || [];
    const attestationObject = new Uint8Array(credential.response.attestationObject);

    return {
      attestationObject: encodeBase64(attestationObject),
      clientDataJSON: encodeBase64(clientDataJSON),
      device_type: credential.authenticatorAttachment || "unknown",
      transports: transports.join(","),
    };
  }
  catch (error) {
    return {
      attestationObject: "",
      clientDataJSON: "",
      device_type: "",
      transports: "",
      error: error instanceof Error ? error.message : "Failed to authenticate with passkey",
    };
  }
}

export async function createPasskeySignInCredential(): Promise<PasskeySignInResult> {
  try {
    const challenge = await handlePasskeyChallenge();

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        userVerification: "required",
        timeout: 60000,
      },
    });

    if (!(credential instanceof PublicKeyCredential)) {
      throw new TypeError("Failed to create public key");
    }

    if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
      throw new TypeError("Unexpected response type");
    }

    return {
      authenticatorData: encodeBase64(new Uint8Array(credential.response.authenticatorData)),
      clientDataJSON: encodeBase64(new Uint8Array(credential.response.clientDataJSON)),
      credentialId: encodeBase64(new Uint8Array(credential.rawId)),
      signature: encodeBase64(new Uint8Array(credential.response.signature)),
    };
  }
  catch (error) {
    return {
      authenticatorData: "",
      clientDataJSON: "",
      credentialId: "",
      signature: "",
      error: error instanceof Error ? error.message : "Failed to authenticate with passkey",
    };
  }
}
