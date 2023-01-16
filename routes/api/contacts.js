const express = require("express");

const router = express.Router();
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../models/contacts");

const Joi = require("joi");
const validator = require("express-joi-validation").createValidator({});

const querySchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  phone: Joi.number().required(),
});

router.get("/", listContacts);

router.get("/:contactId", getContactById);

router.post("/", validator.query(querySchema), addContact);

router.delete("/:contactId", removeContact);

router.put("/:contactId", validator.query(querySchema), updateContact);

module.exports = router;
