import { create } from 'storybook/theming';
import logo from '../src/app/(layoutWithSidebar)/components/Sidebar/logo/logo.svg';

export default create({
  base: 'light',
  brandTitle: 'TIB Assistant',
  brandUrl: 'https://tib.eu',
  brandImage: logo,
  brandTarget: '_self',
});
