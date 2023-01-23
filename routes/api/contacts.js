const express = require("express");

const router = express.Router();
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");

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

router.get("/", tryCatch(listContacts));
router.get("/:contactId", tryCatch(getContactById));
router.post("/", validateBody(schemaAdd), tryCatch(addContact));
router.delete("/:contactId", tryCatch(removeContact));
router.put("/:contactId", validateBody(schemaAdd), tryCatch(updateContact));
router.patch(
  "/:contactId/favorite",
  validateBody(schemaAdd),
  tryCatch(updateStatusContact)
);

module.exports = router;
