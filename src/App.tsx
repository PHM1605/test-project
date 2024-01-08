import React from 'react';
import axios from 'axios';
import './App.css';
//import cs from 'classnames';
//import styled from 'styled-components';
import check_img from './check.png';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

type Story = {
  objectID: string, url: string, title: string, author: string, num_comments: number, points: number
};
type Stories = Array<Story>;
type ItemProps = {item: Story; onRemoveItem: (item:Story)=>void;};
type ListProps = {list: Stories; onRemoveItem: (item:Story)=>void;};

const getSumComments = (stories) => {
  // console.log('C');
  return stories.data.reduce((result, value) => result + value.num_comments, 0);
};

type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
};



interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories;
}

interface StoriesFetchFailureAction {
  type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
  type: 'REMOVE_STORY';
  payload: Story;
}

type StoriesAction = 
  | StoriesFetchInitAction 
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch(action.type) {
    case 'STORIES_FETCH_INIT':
      return {...state, isLoading: true, isError: false};
    case 'STORIES_FETCH_SUCCESS':
      return {...state, isLoading: false, isError: false, data: action.payload};
    case 'STORIES_FETCH_FAILURE':
      return {...state, isLoading: false, isError: true};
    case 'REMOVE_STORY':
      return {...state, 
        data: state.data.filter((story) => action.payload.objectID !== story.objectID)};
    default:
      throw new Error();
  }
};

const List = React.memo(({list, onRemoveItem}: ListProps) => (
  //console.log('B:List') ||
  <ul>
    {list.map((item)=>{
      return (
      <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
      );
    })
    }
  </ul>
));

const Item = React.memo(({item, onRemoveItem}: ItemProps) => (
  <li className="item">
    <span style={{width:"40%"}}><a href={item.url}>{item.title}</a></span>
    <span style={{width:"30%"}}>{item.author}</span>
    <span style={{width:"10%"}}>{item.num_comments}</span>
    <span style={{width:"10%"}}>{item.points}</span>
    <span style={{width:"10%"}}>
      <button type="button" onClick={()=>onRemoveItem(item)} className="button buttonSmall">
        <img src={check_img} alt="check" height="18px" width="18px" />
      </button>
    </span>
  </li>
));

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
  children: React.ReactNode;
};

const InputWithLabel = ({id, value, type='text', onInputChange, isFocused, children}: InputWithLabelProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null!);
  React.useEffect(()=>{
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id} className="label">{children}</label>
      <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} className="input"/>
    </>
  );
};

type SearchFormProps = {
  searchTerm:string; 
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const SearchForm = (
  {searchTerm, onSearchInput, onSearchSubmit}: SearchFormProps) => (
  //console.log("RENDERING SEARCH FORM") ||
  <form onSubmit={onSearchSubmit} className="searchForm">
    <InputWithLabel id="search" value={searchTerm} isFocused onInputChange={onSearchInput}>
      <strong>Search:</strong>
    </InputWithLabel>
    <button type="submit" disabled={!searchTerm} className="button buttonLarge">Submit</button>
  </form>
);

const useSemiPersistentState = (key:string, initialState:string):
[string, (newValue: string)=>void] => {
  const isMounted = React.useRef(false);
  const [value, setValue] = React.useState(localStorage.getItem(key) || initialState);
  React.useEffect(()=>{
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);
  return [value, setValue];
};

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {data: [], isLoading: false, isError: false});

  const handleSearchInput = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, [setSearchTerm]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  };

  const handleFetchStories = React.useCallback(async ()=>{
    dispatchStories({type: 'STORIES_FETCH_INIT'});
    try {
      const result = await axios.get(url);
      dispatchStories({type: 'STORIES_FETCH_SUCCESS', payload: result.data.hits});
    } catch {
      dispatchStories({type: 'STORIES_FETCH_FAILURE'});
    }
  }, [url]);

  React.useEffect(()=>{
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = React.useCallback((item: Story) => {
    dispatchStories({type: 'REMOVE_STORY', payload: item});
  }, []);

  //console.log('B:App');
  const sumComments = React.useMemo(() => getSumComments(stories), [stories]);
  return (
    <div className='container'>
      <h1 className='headline-primary'>My Hacker Stories with {sumComments} comments.</h1>

      <SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSubmit={handleSearchSubmit}/>
      {stories.isError && <p>Something went wrong...</p>}
      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory}/>
      )}
    </div>
  );
};

// const StyledContainer = styled.div`
//   height: 100vw;
//   padding: 20px;
//   background: #83a4d4;
//   background: linear-gradient(to left, #b6fbff, #83a4d4);
//   color: # 171212;
// `;

// const StyledHeadlinePrimary = styled.h1`
//   font-size: 48px;
//   font-weight: 300;
//   letter-spacing: 2px;
// `;

// const StyledItem = styled.li`
//   display: flex;
//   align-items: center;
//   padding-bottom: 5px;
// `;

// const StyledColumn = styled.span`
//   padding: 0px 5px; 
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   a {
//     color: inherit;
//   }
//   width: ${(props)=>props.width};
// `;

// const StyledButton = styled.button`
//   background: transparent;
//   border: 1px solid #171212;
//   padding: 5px;
//   cursor: pointer;
//   transition: all 0.1s ease-in;
//   &:hover {
//     background: #171212;
//     color: #ffffff;
//   }
// `;

// const StyledButtonSmall = styled(StyledButton)`
//   padding: 5px;
// `;

// const StyledButtonLarge = styled(StyledButton)`
//   padding: 10px;
// `;

// const StyledSearchForm = styled.form`
//   padding: 10px 0 20px 0;
//   display: flex;
//   align-items: baseline;
// `;

// const StyledLabel = styled.label`
//   border-top: 1px solid #171212;
//   border-left: 1px solid #171212;
//   padding-left: 5px;
//   font-size: 24px;
// `;

// const StyledInput = styled.input`
//   border: none;
//   border-bottom: 1px solid #171212;
//   background-color: transparent;
//   font-size: 24px;
// `;

// const StyledIcon = styled.img`
//   fill: #ffffff;
//   stroke: #ffffff;
// `;

export default App;
export {storiesReducer, SearchForm, InputWithLabel, List, Item};