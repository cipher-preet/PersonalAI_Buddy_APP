import { NavigationContainer } from '@react-navigation/native';
import MainTabs from './MainTabs';

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
};

export default RootNavigator;