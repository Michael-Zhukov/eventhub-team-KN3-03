import {
  loginRequest,
  registerRequest,
} from "@eventhub/contracts";

import { createZodDto } from "../common/validation/zod-dto";

export class RegisterRequestDto extends createZodDto(registerRequest) {}

export class LoginRequestDto extends createZodDto(loginRequest) {}