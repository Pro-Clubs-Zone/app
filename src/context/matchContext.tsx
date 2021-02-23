import React, {useState, createContext, Dispatch, SetStateAction} from 'react';
import {IMatchNavData} from '../utils/interface';

type MatchContextType = {
  match: IMatchNavData;
  setMatch: Dispatch<SetStateAction<IMatchNavData>>;
};

const MatchContext = createContext<MatchContextType>({} as MatchContextType);

const MatchProvider = (props: any) => {
  const [match, setMatch] = useState<IMatchNavData>({} as IMatchNavData);

  return (
    <MatchContext.Provider value={{match, setMatch}}>
      {props.children}
    </MatchContext.Provider>
  );
};

export {MatchProvider, MatchContext};
