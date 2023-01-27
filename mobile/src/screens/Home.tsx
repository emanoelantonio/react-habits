import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from "react-native";
import { DAY_SIZE, HabitDay } from "../components/HabitDay";
import { Header } from "../components/Header";
import { api } from '../lib/axios';
import { generateRangeDatesFromYearStart } from '../utils/generate-range-between-dates';

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const datesFromYearStart = generateRangeDatesFromYearStart();
const minimumSummaryDatesSize = 18 * 5;
const amountOfDaysToFill = minimumSummaryDatesSize - datesFromYearStart.length;

export function Home() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const { navigate } = useNavigation();

  async function fechData() {
    try {
      setLoading(true);

      const response = await api.get('/summary');

      console.log(response.data);
      setSummary(response.data);

    } catch (error) {
      Alert.alert('Eita!', 'Erro da peste no servidor!')

      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fechData();
  },[])

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />

      <View className="flex-row mt-6 mb-2">
        {
          weekDays.map((weekDay, index) => (
          <Text
            key={`${weekDay}-${index}`}
              className='text-zinc-400 text-xl font-bold text-center mx-1'
              style={{width: DAY_SIZE}}
          >
            {weekDay}
          </Text>
          ))
        }
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}} >
        <View className="flex-row flex-wrap">
          {
            datesFromYearStart.map(date => (
              <HabitDay
                key={date.toISOString()}
                onPress={()=> navigate('habit', { date: date.toISOString() })}
              />
            ))
          }
          {
            amountOfDaysToFill > 0 && Array
              .from({ length: amountOfDaysToFill })
              .map((_, index) => (
                <View
                  key={index}
                  className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                  style={{ width: DAY_SIZE, height: DAY_SIZE }}
                />
              ))
          }
        </View>
      </ScrollView>

    </View>
  )
}