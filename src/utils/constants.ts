import { HttpStatusCode } from '../enums';
import { GlobalConstants } from '../interfaces/globalConstants.interface';

// Define the globalConstants object
export const globalConstants: GlobalConstants = {
  status: {
    success: 'SUCCESS',
    failed: 'FAILED',
  },
  statusCode: {
    HttpsStatusCodeOk: {
      statusCodeName: 'HttpsStatusCodeOk',
      code: HttpStatusCode.OK,
    },
    HttpsStatusCodeCreated: {
      statusCodeName: 'HttpsStatusCodeCreated',
      code: HttpStatusCode.CREATED,
    },
    HttpsStatusCodeNoContent: {
      statusCodeName: 'HttpsStatusCodeNoContent',
      code: HttpStatusCode.NO_CONTENT,
    },
    TemporaryRedirect: {
      statusCodeName: 'TemporaryRedirect',
      code: HttpStatusCode.TEMPORARY_REDIRECT,
    },
    BadRequestException: {
      statusCodeName: 'BadRequestException',
      code: HttpStatusCode.BAD_REQUEST,
    },
    UnauthorizedException: {
      statusCodeName: 'UnauthorizedException',
      code: HttpStatusCode.UNAUTHORIZED,
    },
    NotFoundException: {
      statusCodeName: 'NotFoundException',
      code: HttpStatusCode.NOT_FOUND,
    },
    ForbiddenException: {
      statusCodeName: 'ForbiddenException',
      code: HttpStatusCode.FORBIDDEN,
    },
    NotAcceptableException: {
      statusCodeName: 'NotAcceptableException',
      code: HttpStatusCode.NOT_ACCEPTABLE,
    },
    RequestTimeoutException: {
      statusCodeName: 'RequestTimeoutException',
      code: HttpStatusCode.REQUEST_TIMEOUT,
    },
    ConflictException: {
      statusCodeName: 'ConflictException',
      code: HttpStatusCode.CONFLICT,
    },
    GoneException: {
      statusCodeName: 'GoneException',
      code: HttpStatusCode.GONE,
    },
    HttpVersionNotSupportedException: {
      statusCodeName: 'HttpVersionNotSupportedException',
      code: HttpStatusCode.HTTP_VERSION_NOT_SUPPORTED,
    },
    PayloadTooLargeException: {
      statusCodeName: 'PayloadTooLargeException',
      code: HttpStatusCode.PAYLOAD_TOO_LARGE,
    },
    UnsupportedMediaTypeException: {
      statusCodeName: 'UnsupportedMediaTypeException',
      code: HttpStatusCode.UNSUPPORTED_MEDIA_TYPE,
    },
    UnprocessableEntityException: {
      statusCodeName: 'UnprocessableEntityException',
      code: HttpStatusCode.UNPROCESSABLE_ENTITY,
    },
    InternalServerErrorException: {
      statusCodeName: 'InternalServerErrorException',
      code: HttpStatusCode.INTERNAL_SERVER_ERROR,
    },
    NotImplementedException: {
      statusCodeName: 'NotImplementedException',
      code: HttpStatusCode.NOT_IMPLEMENTED,
    },
    ImATeapotException: {
      statusCodeName: 'ImATeapotException',
      code: HttpStatusCode.I_AM_A_TEAPOT,
    },
    MethodNotAllowedException: {
      statusCodeName: 'MethodNotAllowedException',
      code: HttpStatusCode.METHOD_NOT_ALLOWED,
    },
    BadGatewayException: {
      statusCodeName: 'BadGatewayException',
      code: HttpStatusCode.BAD_GATEWAY,
    },
    ServiceUnavailableException: {
      statusCodeName: 'ServiceUnavailableException',
      code: HttpStatusCode.SERVICE_UNAVAILABLE,
    },
    GatewayTimeoutException: {
      statusCodeName: 'GatewayTimeoutException',
      code: HttpStatusCode.GATEWAY_TIMEOUT,
    },
    PreconditionFailedException: {
      statusCodeName: 'PreconditionFailedException',
      code: HttpStatusCode.PRECONDITION_FAILED,
    },
  },
};
