const Contact = require("./contact.model");

const listContacts = async (req, res) => {
  const contacts = await Contact.find();
  res.status(200).send(contacts);
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await Contact.findById(contactId);
  if (!contact) {
    return res.status(404).json({ message: "Not found" });
  }
  res.status(200).send(contact);
};

const addContact = async (req, res) => {
  const { name, email, phone } = req.body;
  const newContact = await Contact.create({ name, email, phone });
  res.status(201).send(newContact);
};

const removeContact = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndDelete(contactId);

  if (!result) {
    return res.status(404).json({ message: "Not found" });
  }
  res.status(200).json({ message: "contact deleted" });
};

const updateContact = async (req, res) => {
  const { contactId } = req.params;

  const updetedContact = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!updetedContact) {
    return res.status(404).json({ message: "Not found" });
  }
  res.status(200).send(updetedContact);
};

const updateStatusContact = async (req, res) => {
  const { contactId } = req.params;
  const { favorite } = req.body;
  if (!favorite) {
    return res.status(404).json({ message: "Not found" });
  }
  const updetedStatus = await Contact.findByIdAndUpdate(contactId, favorite, {
    new: true,
  });
  res.status(200).send(updetedStatus);
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
