const express = require("express");

const contactsRouter = express.Router();
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require("../../controllers/contacts.controller");

const Joi = require("joi");
const tryCatch = require("../../utils/try-catch.util");

const schemaAdd = Joi.object(
  {
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
      })
      .required(),
    phone: Joi.number().integer().required(),
    favorite: Joi.bool(),
  },
  { allowUnknown: false }
);

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "missing required name field" });
    }
    next();
  };
};

const schemaUpdateStatus = Joi.object(
  {
    favorite: Joi.bool().required(),
  },
  { allowUnknown: false }
);

const validateBodyStatus = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "missing field favorite" });
    }
    next();
  };
};

contactsRouter.get("/", tryCatch(listContacts));
contactsRouter.get("/:contactId", tryCatch(getContactById));
contactsRouter.post("/", validateBody(schemaAdd), tryCatch(addContact));
contactsRouter.delete("/:contactId", tryCatch(removeContact));
contactsRouter.put(
  "/:contactId",
  validateBody(schemaAdd),
  tryCatch(updateContact)
);
contactsRouter.patch(
  "/:contactId/favorite",
  validateBodyStatus(schemaUpdateStatus),
  tryCatch(updateStatusContact)
);

module.exports = contactsRouter;
