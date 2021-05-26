import React from 'react';
import {Meta, Story} from '@storybook/react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faGlobeAfrica} from '@fortawesome/free-solid-svg-icons';
import {Filter, FilterProps} from './index';
import PrimaryTheme from "../../themes/primary";
import dataRegions from '../mockData/regions.json';
import dataMembersState from '../mockData/member-state.json';
import groupsRec from '../mockData/groups-rec.json';
import groupAfcfta from '../mockData/group-afcfta.json';
import groupEconomic from '../mockData/group-income.json';

export default {
  title: 'Filter/Multiple Selection',
  components: Filter,
} as Meta;

const handleOnChange = (d) => console.log(d);

const Template: Story<FilterProps> = (args) => (
  <PrimaryTheme cssVars={{
    '--border-radius': '5px',
    '--color-border': '#efeae0',
    '--color-background': '#f9f7f4',
    '--color-text-lightest': '#d8d8d8',
    '--color-text-lighter': '#ab9772',
    '--color-accent': '#6b805e',
    '--color-highlight': '#9db891',
    '--color-disabled': '#666666',
    '--font-size': '16px',
    '--font-size-h22': '24px',
    '--font-sans-serif-primary': 'Roboto, sans-serif',
    '--font-sans-serif-secondary': 'Open Sans, sans-serif',
    '--font-serif-primary': 'Museo, serif',
    '--font-weight-normal': 300,
    '--font-weight-semi-bold': 500,
    '--font-weight--bold': 600,
    '--font-weight-black': 700,
  }}>
    <div style={{backgroundColor: "#eee", padding: 15}}>
      <Filter {...args} />
    </div>
  </PrimaryTheme>
);

export const MultipleSelection = Template.bind({});
MultipleSelection.args = {
  width: 350,
  label: 'For',
  icon: <FontAwesomeIcon icon={faGlobeAfrica} size="2x"/>,
  bgColor: '#fff',
  maxSelectedItems: 8,
  multipleSelection: true,
  onChange: handleOnChange,
  preSelected: [],
  summaryText: 'Multiple regions',
  dataGroup: [
    {
      label: 'Regions',
      data: dataRegions,
      cascade: false,
    },
    {
      label: 'REC',
      data: groupsRec,
      cascade: false,
    },
    {
      label: 'AfCFTA',
      data: groupAfcfta,
      cascade: false,
    },
    {
      label: 'Economic',
      data: groupEconomic,
      cascade: false,
    },
    {
      label: 'Members state',
      data: dataMembersState,
      cascade: false,
    },
  ],
};

export const SingularSelection = Template.bind({});
SingularSelection.args = {
  width: 350,
  label: 'For',
  icon: <FontAwesomeIcon icon={faGlobeAfrica} size="2x"/>,
  bgColor: '#fff',
  multipleSelection: false,
  onChange: handleOnChange,
  preSelected: [],
  summaryText: 'Multiple regions',
  dataGroup: [
    {
      label: 'Members state',
      data: dataMembersState,
      cascade: false,
    },
  ],
};
