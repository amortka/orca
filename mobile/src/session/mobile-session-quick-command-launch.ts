import { buildMobileQuickCommandLaunch } from '../terminal/quick-commands'
import type { MobileQuickCommandLaunch } from '../terminal/quick-commands'
import { triggerError } from '../platform/haptics'
import type { TerminalQuickCommand } from '../../../src/shared/terminal-quick-command-types'
import { getTerminalQuickCommandArguments } from '../../../src/shared/terminal-quick-command-arguments'
import type { MobileNewTabAgentOption } from './mobile-new-tab-agent-options'
import type { MobileSessionAttachmentsModel } from './use-mobile-session-attachments'

export function launchMobileSessionQuickCommand(
  scope: Pick<
    MobileSessionAttachmentsModel,
    | 'client'
    | 'connState'
    | 'creatingTerminalRef'
    | 'creatingBrowser'
    | 'creatingMarkdown'
    | 'showToast'
  >,
  createTerminal: (
    agent?: MobileNewTabAgentOption['agent'],
    options?: MobileQuickCommandLaunch['options'] & { errorToast?: string }
  ) => Promise<unknown>,
  command: TerminalQuickCommand
): boolean {
  if (
    !scope.client ||
    scope.connState !== 'connected' ||
    scope.creatingTerminalRef.current ||
    scope.creatingBrowser ||
    scope.creatingMarkdown
  ) {
    return false
  }
  // Why: mobile has no argument prompt yet; running would send literal `{{name}}` tokens.
  if (getTerminalQuickCommandArguments(command).length > 0) {
    triggerError()
    scope.showToast('Run quick commands with arguments from desktop', 1800)
    return false
  }
  const launch = buildMobileQuickCommandLaunch(command)
  if (!launch) {
    triggerError()
    scope.showToast('Edit this quick command before running it', 1800)
    return false
  }
  const label = command.label.trim() || 'Quick command'
  void createTerminal(launch.agent, { ...launch.options, errorToast: `Couldn't run ${label}` })
  return true
}
