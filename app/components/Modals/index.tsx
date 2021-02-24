import { useRouter } from "next/router";
import { useContext } from "react";

import { routes } from "../../lib/routes";
import { state } from "../../lib/state";
import { StateContext } from "../StateContext";
import CreateTest from "./CreateTest";
import DeleteTests from "./DeleteTests";
import Environments from "./Environments";
import TeamSettings from "./TeamSettings";
import Triggers from "./Triggers";

export default function Modals(): JSX.Element {
  const { pathname } = useRouter();

  const { modal } = useContext(StateContext);
  const { name, teamId, testIds, tests } = modal || {};

  const closeModal = () => state.setModal({ name: null });

  const isTest = pathname.includes(`${routes.test}/`); // include slash to not match dashboard

  const isSuites = pathname.includes(routes.suites);
  const isTests = pathname.includes(routes.tests);
  const isDashboard = isSuites || isTests;

  if (isTests && name === "createTest") {
    return <CreateTest closeModal={closeModal} />;
  }

  if (isTests && name === "deleteTests" && tests) {
    return <DeleteTests closeModal={closeModal} tests={tests} />;
  }

  if ((isDashboard || isTest) && name === "environments") {
    return <Environments closeModal={closeModal} />;
  }

  if (isDashboard && name === "teamSettings" && teamId) {
    return <TeamSettings closeModal={closeModal} teamId={teamId} />;
  }

  if ((isDashboard || isTest) && name === "triggers" && testIds) {
    return <Triggers closeModal={closeModal} testIds={testIds} />;
  }

  return null;
}
