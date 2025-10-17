/* eslint-disable prettier/prettier */
/* eslint-disable no-trailing-spaces */

import { useNavigation, NavigationProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { MaternityScreen } from '../screens/Maternity/Maternity';
import { MatAnimalNoFeeded } from '../screens/Maternity/Mat-AniNomalFeeded';
import { MaternityFeedIssues } from '../screens/Maternity/Mat-FeedIssues';
import { MatDeviceIssue } from '../screens/Maternity/Mat-DeviceIssue';
import { MatCorralDetail } from '../screens/Maternity/Mat-CorralDetail';
import CorralScreen from './CorralScreen';
import MaternidadScreen from '../screens/HomeScreen/MaternidadScren';
import CorralMaternidadSinAnimalesScreen from './CorralMaternidadSinAnimalesScreen';
import MatAddAnimalsScreen from './MatAddAnimalsScreen';
import CorralMaternidadConAnimalesScreen from './CorralMaternidadConAnimalesScreen';
import TodosAnimalesMaternidad from './TodosAnimalesMaternidad';
import NoAlimentadosScreenMaternidad from './NoAlimentadosScreenMaternidad';



const MaternityStack = createStackNavigator();


export const MaternityStackNavigator = () => {

   const navigator = useNavigation();


   useEffect(() => {
      navigator.setOptions({
         headerShown: false,
         // headerStyle:{
         //     elevation:15,
         // },




      });

   }, [navigator]);

   return (
      <MaternityStack.Navigator

         screenOptions={
            {
               // cardStyle: { backgroundColor: '#9FFFFF', borderRadius: 10},
               // headerBackTitleVisible: true,
               // headerLeft:()=>null,
               // headerTitle:"fasdfasd  ",         
               headerShown: false,
               headerStyle: {
                  elevation: 5,
               },

            }}
      >
         <MaternityStack.Screen name="MAT-HOME" component={MaternidadScreen} options={{ title: 'Maternidad', headerShown: true, headerStyle: { elevation: 5 }, }} />
         <MaternityStack.Screen name="MAT-ANINOFEED" component={MatAnimalNoFeeded} options={{ title: 'No feed animals', headerShown: true, headerStyle: { elevation: 5 }, }} />
         <MaternityStack.Screen name="MAT-FEEDISSUE" component={MaternityFeedIssues} options={{ title: 'Feed issue', headerShown: true, headerStyle: { elevation: 5 }, }} />
         <MaternityStack.Screen name="MAT-DEVICEISSUE" component={MatDeviceIssue} options={{ title: 'Device issue', headerShown: true, headerStyle: { elevation: 5 }, }} />
         <MaternityStack.Screen name="MAT-CORRALDETAIL" component={MatCorralDetail} options={{ title: 'Corral details', headerShown: true, headerStyle: { elevation: 5 }, }} />
         <MaternityStack.Screen
            name="MAT-CORRAL"
            component={CorralScreen}
            options={{ title: 'Corral', headerShown: true, headerStyle: { elevation: 5 } }}
         />
         <MaternityStack.Screen
            name="CorralSinAnimales"
            component={CorralMaternidadSinAnimalesScreen}
            options={{ title: 'Corral Maternidad', headerShown: true, headerStyle: { elevation: 5 } }}
         />
         <MaternityStack.Screen
            name="MAT-ADD-ANIMALS"
            component={MatAddAnimalsScreen}
            options={{ title: 'Asignar animales', headerShown: true, headerStyle: { elevation: 5 } }}
         />
         {/* <MaternityStack.Screen
            name="CorralSinAnimales"
            component={CorralMaternidadSinAnimalesScreen}
            options={{ title: 'Corral Maternidad', headerShown: true }}
         /> */}

         <MaternityStack.Screen
            name="NoAlimentadosMaternidad"
            component={NoAlimentadosScreenMaternidad}
            options={{ title: 'Animales no Alimentados', headerShown: true }}
         />

         <MaternityStack.Screen
            name="CorralConAnimales"
            component={CorralMaternidadConAnimalesScreen}
            options={{ title: 'Corral Maternidad animales', headerShown: true }}
         />
         <MaternityStack.Screen
            name="TodosAnimalesMaternidad"
            component={TodosAnimalesMaternidad}
            options={{ title: 'Todos los Animales', headerShown: true }} />


         {/* <DRegistationStack.Screen name="DR-SETUP" component={TopTabDrSetupNavigator} 
            options={{ title: 'Dosimac Setup',headerShown: true, headerLeft:()=>null,headerStyle:{elevation:5} }}
            //screenOptions={{}}
      /> */}


      </MaternityStack.Navigator>

   );
};
