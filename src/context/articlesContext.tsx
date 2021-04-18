import React, {useState, createContext, Dispatch, SetStateAction} from 'react';
import {Article} from '../utils/interface';

type ArticlesContextType = {
  articles: Article[];
  setArticles: Dispatch<SetStateAction<Article[]>>;
};

const ArticlesContext = createContext<ArticlesContextType>(
  {} as ArticlesContextType,
);

const ArticlesProvider = (props: any) => {
  const [articles, setArticles] = useState<Article[]>([]);

  return (
    <ArticlesContext.Provider value={{articles, setArticles}}>
      {props.children}
    </ArticlesContext.Provider>
  );
};

export {ArticlesProvider, ArticlesContext};
