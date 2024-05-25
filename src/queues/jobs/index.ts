export enum QueueEventJobs {
  VERIFY_OTP = 'verify_otp',
  ACCOUNT_DELETION_EMAIL = 'account_deletion_email',
  WELCOME_EMAIL = 'welcome_email',
  CONNECTION_REQUEST_EMAIL = 'connection_request_email',
  CONNECTION_REQUEST_ACCEPTANCE_EMAIL = 'connection_request_acceptance_email',
  LIVE_STREAMING_REGISTERED_EMAIL = 'live_streaming_registered_email',
  JOB_ALERT_EMAIL = 'job_alert_email',
  UNIVERSITY_NOTICE_EMAIL = 'university_notice_email',
  OFFLINE_EVENT_EMAIL = 'offline_event_email',
}

export enum JobPriority {
  HIGHEST = 1,
  HIGH = 2,
  MEDIUM_HIGH = 3,
  MEDIUM = 4,
  MEDIUM_LOW = 5,
  LOW = 6,
  LOWEST = 7,
}
