import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../config";

const createToken = (
  payload: Record<string, unknown>,
  secret: string,
  expireTime: string
): string => {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: expireTime as unknown as jwt.SignOptions[ "expiresIn" ],
  };
  return jwt.sign( payload, secret, options );
};

const verifyToken = ( token: string, secret: string ): JwtPayload => {
  return jwt.verify( token, secret ) as JwtPayload;
};

const createPasswordResetToken = ( payload: object ): string => {
  const secret = config.jwt.secret!;
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: config.jwt.passwordResetTokenExpirationTime as unknown as jwt.SignOptions[ "expiresIn" ],
  };
  return jwt.sign( payload, secret, options );
};

export const jwtHelpers = {
  createToken,
  verifyToken,
  createPasswordResetToken,
};
