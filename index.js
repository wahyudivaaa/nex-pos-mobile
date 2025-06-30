import { registerRootComponent } from 'expo';
import App from './App';

// Register the main App component instead of the duplicated layout
registerRootComponent(App);