import TableRowAssetIcon from '@valenced/components/TableRowAssetIcon'
import { BuildEnvironment, FullVersion } from '~/constants'
import ShrubcordIcon from '~assets/ShrubcordIcon'
import { Setting } from '../constants'
import { CopyableSetting } from './shared'
import type { SettingsItem } from '@valenced/discord/modules/settings'

const ValencedVersionSetting: SettingsItem = CopyableSetting(
    {
        parent: Setting.Valenced,
        IconComponent: () => <TableRowAssetIcon id={ShrubcordIcon} />,
        useTitle: () => 'Shrubcord',
    },
    () => `${FullVersion} (${BuildEnvironment})`,
)

export default ValencedVersionSetting
