const fs = require("fs/promises");
const path = require("path");

const contactsPath = path.resolve("./models/contacts.json");

function getContacts() {
  return fs.readFile(contactsPath, "utf8");
}

const listContacts = async (req, res) => {
  try {
    const contacts = await getContacts();
    res.status(200).send(JSON.parse(contacts));
  } catch (error) {
    console.log(error);
  }
};

const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contacts = await getContacts();
    const contactsJson = JSON.parse(contacts);
    const contact = contactsJson.find((contact) => {
      return contact.id === contactId;
    });
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).send(contact);
  } catch (error) {
    console.log(error);
  }
};

const addContact = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const contacts = await getContacts();
    const contactsJson = JSON.parse(contacts);
    const newContact = {
      id: Date.now(),
      name,
      email,
      phone,
    };
    contactsJson.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contactsJson));
    res.status(201).send(newContact);
  } catch (error) {
    console.log(error);
  }
};

const removeContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contacts = await getContacts();
    const contactsJson = JSON.parse(contacts);
    const index = contactsJson.findIndex((contact) => contact.id === contactId);
    if (index === -1) {
      return res.status(404).json({ message: "Not found" });
    }
    contactsJson.splice(index, 1);
    await fs.writeFile(contactsPath, JSON.stringify(contactsJson, null, 2));
    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    console.log(error);
  }
};

const updateContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { name, email, phone } = req.body;
    const contacts = await getContacts();
    const contactsJson = JSON.parse(contacts);
    const [contact] = contactsJson.filter(
      (contact) => contact.id === contactId
    );
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    contact.name = name;
    contact.email = email;
    contact.phone = phone;
    await fs.writeFile(contactsPath, JSON.stringify(contactsJson));
    res.status(200).send(contact);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
