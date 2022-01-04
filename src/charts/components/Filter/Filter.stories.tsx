import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { default as Filter, FilterProps } from './index';
import { default as SearchBox } from './SearchBox';
import { default as Summary } from './Summary';
import { NestedTree, FlattenTree } from './Tree';
import { default as SuggestedList } from './SuggestedList';
import { default as SelectedItems } from './SelectedItems';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons/faCheckSquare';
import { faSquare } from '@fortawesome/free-solid-svg-icons/faSquare';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import cloneDeep from 'lodash/cloneDeep';
import afcfta from './mockData/afcfta.json';
import rec from './mockData/rec.json';
import regions from './mockData/regions.json';
import status from './mockData/status.json';

const DATA_TYPES = {
  NESTED: 0,
  FLATTENED: 1,
};

const TABS_DATA = [
  {
    label: 'AfCFTA',
    data: afcfta,
    type: DATA_TYPES.FLATTENED,
    isDisabled: true,
  },
  {
    label: 'REC',
    data: rec,
    type: DATA_TYPES.FLATTENED,
    isDisabled: false,
  },
  {
    label: 'Regions',
    data: regions,
    type: DATA_TYPES.NESTED,
    isDisabled: false,

  },
  {
    label: 'Status',
    data: status,
    type: DATA_TYPES.FLATTENED,
    isDisabled: false,
  },
];

export default {
  title: 'Filter/Primary',
  components: Filter,
} as Meta;

const Template: Story<FilterProps> = (args) => {
  const generateTreeData = (dataSource) => {
    const idMapping = [...dataSource].reduce((acc, el, i) => {
      acc[el.value] = i;
      return acc;
    }, {});

    let root = null;
    [...dataSource].forEach((el) => {
      // Handle the root element
      if (!el.parent) {
        root = el;
        return;
      }
      // Use our mapping to locate the parent element in our data array
      const parentEl = dataSource[idMapping[el.parent]];
      // Add our current el to its parent's `children` array
      parentEl.children = [...(parentEl.children || []), el];
    });

    return root;
  };
  const [keyword, setKeyword] = useState('');
  const [selectedItems, setSelectedItems] = useState(['1041', '1042']);
  const [selectedTab, setSelectedTab] = useState(1);

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const updateSelectedItems = (item) => {
    if (selectedItems.length >= 8 && item.flag === true) {
      return ;
    }
    if (item.flag && !selectedItems.includes(item.value)) {
      setSelectedItems(Array.from(new Set([...selectedItems, item.value])));
    } else {
      setSelectedItems(Array.from(new Set(selectedItems.filter((d) => d !== item.value))));
    }
    setKeyword('');
  };

  return (
    <Filter {...args}>
      <SearchBox
        iconSearch={<FontAwesomeIcon icon={faSearch} />}
        iconClose={<FontAwesomeIcon icon={faTimes} />}
        placeholder={'Keyword'}
        keyword={keyword}
        onSearch={(value) => {
          setKeyword(value);
        }}
      />
      <Summary text={'Multiple reporter'} />
      <SuggestedList keyword={keyword} onSelect={updateSelectedItems} selectedItems={selectedItems} />
      {selectedItems && selectedItems.length > 0 && (
        <SelectedItems selectedItems={selectedItems} onDeselect={() => {}} icon={null} />
      )}
      <Tabs value={selectedTab} onChange={handleChangeTab}>
        {TABS_DATA.map(({ label, isDisabled }) => (
          <Tab label={label} disabled={isDisabled}/>
        ))}
      </Tabs>
      {TABS_DATA.map(({ label, data, type }, i) => (
        <div key={label.replaceAll(' ', '')} hidden={i !== selectedTab}>
          {type === DATA_TYPES.NESTED && (
            <NestedTree
              data={generateTreeData(cloneDeep(data))}
              iconCheck={<FontAwesomeIcon icon={faCheckSquare} />}
              iconUncheck={<FontAwesomeIcon icon={faSquare} />}
              iconExpand={<FontAwesomeIcon icon={faChevronDown} />}
              iconCollapse={<FontAwesomeIcon icon={faChevronUp} />}
              selectedItems={selectedItems}
              expandByDefault={1}
              onChange={updateSelectedItems}
            />
          )}
          {type === DATA_TYPES.FLATTENED && (
            <FlattenTree
              data={cloneDeep(data)}
              iconCheck={<FontAwesomeIcon icon={faCheckSquare} />}
              iconUncheck={<FontAwesomeIcon icon={faSquare} />}
              selectedItems={selectedItems}
              onChange={updateSelectedItems}
            />
          )}
        </div>
      ))}
      {selectedItems.length >= 8 && <div>You can only selection maximum 8 items</div>}
    </Filter>
  );
};

export const Primary = Template.bind({});
