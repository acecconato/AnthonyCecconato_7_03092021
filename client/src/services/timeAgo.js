import TimeAgo from 'javascript-time-ago'
import fr from 'javascript-time-ago/locale/fr'

TimeAgo.addDefaultLocale(fr)
const timeAgo = new TimeAgo('fr-FR')

export default timeAgo
