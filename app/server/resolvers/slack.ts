import { db } from "../db";
import { createIntegration } from "../models/integration";
import { updateTeam } from "../models/team";
import { createSlackIntegrationUrl, findSlackWebhook } from "../services/slack";
import {
  Context,
  CreateSlackIntegrationMutation,
  CreateUrlMutation,
  Integration,
} from "../types";
import { ensureTeamAccess, ensureUser } from "./utils";

export const createSlackIntegrationResolver = async (
  _: Record<string, unknown>,
  { redirect_uri, slack_code, team_id }: CreateSlackIntegrationMutation,
  { logger, teams }: Context
): Promise<Integration> => {
  const log = logger.prefix("createSlackIntegrationResolver");
  const team = ensureTeamAccess({ logger, teams, team_id });

  const slackWebhook = await findSlackWebhook({
    logger,
    redirect_uri,
    slack_code,
  });

  return db.transaction(async (trx) => {
    const integration = await createIntegration(
      {
        settings_url: slackWebhook.settings_url,
        slack_channel: slackWebhook.slack_channel,
        team_id: team.id,
        team_name: slackWebhook.slack_team,
        type: "slack",
        webhook_url: slackWebhook.webhook_url,
      },
      { logger, trx }
    );
    log.debug("created integration", integration.id);

    await updateTeam(
      {
        id: team_id,
        is_email_alert_enabled: false,
        alert_integration_id: integration.id,
      },
      { logger, trx }
    );
    log.debug("updated team", team_id);

    return integration;
  });
};

export const createSlackIntegrationUrlResolver = (
  _: Record<string, unknown>,
  { redirect_uri }: CreateUrlMutation,
  { logger, user: contextUser }: Context
): string => {
  const log = logger.prefix("createSlackIntegrationUrlResolver");
  const user = ensureUser({ logger, user: contextUser });

  const url = createSlackIntegrationUrl(redirect_uri);
  log.debug("url for user", user.id);

  return url;
};
