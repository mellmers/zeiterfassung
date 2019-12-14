import { Link } from 'preact-router/match';

import style from './style.scss';

const Header = () => (
	<header className={style.header}>
		<Link href="/"><h1>Zeiterfassung</h1></Link>
		<nav>
			<Link activeClassName={style.active} href="/profile">Me</Link>
			<Link activeClassName={style.active} href="/profile/john">John</Link>
		</nav>
	</header>
);

export default Header;
