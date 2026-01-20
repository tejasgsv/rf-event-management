const Joi = require('joi');

/**
 * Input Validation Schemas
 * Uses Joi for robust validation with clear error messages
 */

// Admin Login Validation
const validateLoginData = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(1)
      .required()
      .messages({
        'string.min': 'Password cannot be empty',
        'any.required': 'Password is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Event Creation/Update Validation
const validateEventData = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.min': 'Event name cannot be empty',
        'string.max': 'Event name cannot exceed 255 characters',
        'any.required': 'Event name is required'
      }),
    startDate: Joi.date()
      .required()
      .messages({
        'date.base': 'Start date must be a valid date',
        'any.required': 'Start date is required'
      }),
    endDate: Joi.date()
      .when('startDate', {
        is: Joi.exist(),
        then: Joi.date().min(Joi.ref('startDate')).messages({
          'date.min': 'End date must be after start date'
        })
      })
      .required()
      .messages({
        'date.base': 'End date must be a valid date',
        'any.required': 'End date is required'
      }),
    venue: Joi.string()
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.min': 'Venue cannot be empty',
        'string.max': 'Venue cannot exceed 255 characters',
        'any.required': 'Venue is required'
      }),
    description: Joi.string()
      .max(1000)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    helpdeskContact: Joi.string()
      .max(255)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Helpdesk contact cannot exceed 255 characters'
      }),
    emergencyContact: Joi.string()
      .max(255)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Emergency contact cannot exceed 255 characters'
      }),
    status: Joi.string()
      .valid('DRAFT', 'PUBLISHED', 'ARCHIVED')
      .default('DRAFT')
      .optional()
      .messages({
        'any.only': 'Status must be DRAFT, PUBLISHED, or ARCHIVED'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Masterclass/Session Validation
const validateMasterclassData = (data) => {
  const schema = Joi.object({
    eventId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Event ID must be a number',
        'number.integer': 'Event ID must be an integer',
        'number.positive': 'Event ID must be positive',
        'any.required': 'Event ID is required'
      }),
    title: Joi.string()
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 255 characters',
        'any.required': 'Title is required'
      }),
    description: Joi.string()
      .max(1000)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    startTime: Joi.date()
      .required()
      .messages({
        'date.base': 'Start time must be a valid date',
        'any.required': 'Start time is required'
      }),
    endTime: Joi.date()
      .when('startTime', {
        is: Joi.exist(),
        then: Joi.date().min(Joi.ref('startTime')).messages({
          'date.min': 'End time must be after start time'
        })
      })
      .required()
      .messages({
        'date.base': 'End time must be a valid date',
        'any.required': 'End time is required'
      }),
    location: Joi.string()
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.min': 'Location cannot be empty',
        'string.max': 'Location cannot exceed 255 characters',
        'any.required': 'Location is required'
      }),
    capacity: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'number.base': 'Capacity must be a number',
        'number.integer': 'Capacity must be an integer',
        'number.min': 'Capacity must be at least 1',
        'number.max': 'Capacity cannot exceed 1000',
        'any.required': 'Capacity is required'
      }),
    registrationCloseTime: Joi.date()
      .default(() => new Date(Date.now() - 24 * 60 * 60 * 1000)) // 24 hours ago
      .optional()
      .messages({
        'date.base': 'Registration close time must be a valid date'
      }),
    waitlistCloseTime: Joi.date()
      .default(() => new Date(Date.now() - 1 * 60 * 60 * 1000)) // 1 hour ago
      .optional()
      .messages({
        'date.base': 'Waitlist close time must be a valid date'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// User Registration Validation
const validateRegistrationData = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.min': 'Name cannot be empty',
        'string.max': 'Name cannot exceed 255 characters',
        'any.required': 'Name is required'
      }),
    surname: Joi.string()
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.min': 'Surname cannot be empty',
        'string.max': 'Surname cannot exceed 255 characters',
        'any.required': 'Surname is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    mobile: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid mobile number',
        'any.required': 'Mobile number is required'
      }),
    company: Joi.string()
      .max(255)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Company name cannot exceed 255 characters'
      }),
    jobTitle: Joi.string()
      .max(255)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Job title cannot exceed 255 characters'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  validateLoginData,
  validateEventData,
  validateMasterclassData,
  validateRegistrationData
};
