import z from "zod";
import { UserSchema } from "../types/user.type";
// re-use UserSchema from types
export const CreateUserDTO = UserSchema.pick({
  // firstName: true,
  // lastName: true,
  email: true,
  username: true,
  password: true,
  image: true,
  location: true,
  phoneNumber: true,
  DOB: true,
  gender: true,
})
  .extend(
    // add new attribute to zod
    {
      confirmPassword: z.string().min(6),
      role: z.enum(["user", "admin", "driver"]).default("user"),
    },
  )
  .refine(
    // extra validation for confirmPassword
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email: z.email(),
  password: z.string().min(6),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.partial(); // all attributes optional
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
