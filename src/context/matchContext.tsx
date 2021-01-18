import React, {useState, createContext, Dispatch, SetStateAction} from 'react';
import {FixtureList} from '../utils/interface';

const MatchContext = createContext<{
  matches: FixtureList[];
  setMatches: Dispatch<SetStateAction<FixtureList[]>>;
}>(null);

const MatchProvider = (props: any) => {
  const [matches, setMatches] = useState<FixtureList[]>([]);

  return (
    <MatchContext.Provider value={{matches, setMatches}}>
      {props.children}
    </MatchContext.Provider>
  );
};

export {MatchProvider, MatchContext};
