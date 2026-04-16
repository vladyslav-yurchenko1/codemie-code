/**
 * Skills Sync
 *
 * Silently re-fetches registered skills from the CodeMie platform
 * and updates their local SKILL.md files with the latest content.
 */

import { ConfigLoader } from '@/utils/config.js';
import { getCodemieClient } from '@/utils/sdk-client.js';
import { registerClaudeSkill } from '@/cli/commands/skills/setup/generators/claude-skill-generator.js';
import { logger } from '@/utils/logger.js';

/**
 * Sync all registered skills with the latest content from the platform.
 * Runs silently — errors are logged but never surfaced to the user.
 */
export async function syncRegisteredSkills(profileName?: string): Promise<void> {
	try {
		const config = await ConfigLoader.load(process.cwd(), profileName ? { name: profileName } : undefined);
		const registeredSkills = config.codemieSkills ?? [];

		if (registeredSkills.length === 0) {
			return;
		}

		const client = await getCodemieClient();

		for (const skill of registeredSkills) {
			try {
				const detail = await (client as any).skills.get(skill.id);
				await registerClaudeSkill(detail);
				logger.debug(`[skills-sync] Synced skill: ${skill.name}`);
			} catch (error) {
				logger.debug(`[skills-sync] Failed to sync skill ${skill.name}`, { error });
			}
		}
	} catch (error) {
		logger.debug('[skills-sync] Sync failed', { error });
	}
}
