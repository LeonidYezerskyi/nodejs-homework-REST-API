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

const schemaAdd = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
  phone: Joi.number().integer().required(),
  favorite: Joi.bool(),
});

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "missing required name field" });
    }
    next();
  };
};

router.get("/", listContacts);

router.get("/:contactId", getContactById);
router.post("/", validateBody(schemaAdd), addContact);

router.delete("/:contactId", removeContact);

router.put("/:contactId", validateBody(schemaAdd), updateContact);

module.exports = router;
