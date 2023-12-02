import AdminRegistationAdded from "./adminRegistationAdded";
import AdminRegistationDeleted from "./adminRegistationDeleted";
import NewAnswerEmail from "./newAnwser";
import NewMessageEmail from "./newMessage";
import RegistrationApprovedEmail from "./registationApproved";
import RegistrationRecordedEmail from "./registrationRecorded";
import StartEmail from "./start";
import UnregisteredEmail from "./unregistered";

export const templatesComponent = {
  adminRegistrationAdded: AdminRegistationAdded,
  adminRegistrationDeleted: AdminRegistationDeleted,
  registrationRecorded: RegistrationRecordedEmail,
  registrationApproved: RegistrationApprovedEmail,
  unregistered: UnregisteredEmail,
  newMessage: NewMessageEmail,
  newAnswer: NewAnswerEmail,
  start: StartEmail,
} as const;

export const templates = Object.entries(templatesComponent);
