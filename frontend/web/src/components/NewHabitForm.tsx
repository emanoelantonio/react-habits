import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'phosphor-react';
import { FormEvent, useState } from 'react';
import { api } from '../libs/axios';

const avaliableWeekDays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function NewHabitForm() {

  const [ title, setTitle ] = useState('');
  const [ weekDays, setWeekDays ] = useState<number[]>([]);

  async function createNewHabit(event:FormEvent) {
    event.preventDefault();

    if (!title || weekDays.length === 0) {
      return;
    }

    await api.post('habits', {
      title,
      weekDays
    });

    setTitle('');
    setWeekDays([]);

    alert('Hábito criado com sucesso!');
  }

  function handleToggleWeekDay(weekDay:number) {
    if (weekDays.includes(weekDay)) {
      const weekDaysWithRemovedOne = weekDays.filter(day => day !== weekDay);

      setWeekDays(weekDaysWithRemovedOne);
    } else {
      const weekDayWithAddedOne = [...weekDays, weekDay];

      setWeekDays(weekDayWithAddedOne);
    }
  }

  return (
    <form onSubmit={createNewHabit} className="w-full flex flex-col mt-6">
      <label htmlFor="title" className="font-semibold leading-tight">
        Qual o seu compromisso?
      </label>

      <input
        className="p-4 rounded-lg mt-3 bg-zinc-800 text-white placeholder:text-zinc-400"
        type="text"
        id="title"
        placeholder="ex.: Beber 2L de água, limpar os livros..."
        autoFocus
        value={title}
        onChange={event=>setTitle(event.target.value)}
      />

      <label htmlFor="" className="font-semibold leading-tight mt-4">
        Qual a recorrência?
      </label>

      <div className="mt-3 flex flex-col gap-2">
        {
          avaliableWeekDays.map((weekday, index) => {
            return (
              <Checkbox.Root
                key={weekday}
                checked={weekDays.includes(index)}
                className="flex items-center gap-3 group"
                onCheckedChange={() => handleToggleWeekDay(index)}
              >

                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500">
                  <Checkbox.Indicator>
                    <Check size={20} className="text-white" />
                  </Checkbox.Indicator>
                </div>

                <span className="text-white leading-tight">
                  {weekday}
                </span>

              </Checkbox.Root>

            );
          })
        }


      </div>

      <button
        className="mt-6 rounded-lg p-4 flex items-center justify-center gap-3 font-semibold bg-green-600 hover:bg-green-500"
        type="submit"
      >
        <Check size={20} weight="bold" />
        Confirmar
      </button>
    </form>
  );
}
