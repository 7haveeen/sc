import type { UserInfo } from "remult";
import type { SuperValidated } from "sveltekit-superforms";

export type StepItem = {
  id: number;
  name: string;
  value: string;
  icon: any;
};

export type JoinPageData = {
  form: SuperValidated<{ email: string }>;
  user?: UserInfo;
  passkeyForm?: SuperValidated<{
    name: string;
    attestation_object: string;
    client_data_json: string;
    device_type: string;
    transports: string;
  }>;
  passwordForm?: SuperValidated<{
    password: string;
    confirmPassword: string;
  }>;
  credentialUserId?: string;
};

export type StepProps = {
  data: JoinPageData;
  onComplete?: () => void;
};
