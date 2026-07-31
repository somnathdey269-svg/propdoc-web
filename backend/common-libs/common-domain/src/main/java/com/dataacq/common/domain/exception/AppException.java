package com.dataacq.common.domain.exception;

import lombok.Getter;

/**
 * Typed base exception for all platform errors.
 * Every service throws AppException — never raw RuntimeException.
 */
@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;
    private final int httpStatus;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
    }

    public AppException(ErrorCode errorCode, String detailMessage) {
        super(detailMessage);
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
    }

    public AppException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.httpStatus = errorCode.getHttpStatus();
    }
}
