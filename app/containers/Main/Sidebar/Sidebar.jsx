// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { Connector } from 'react-redux';

import * as uiActions from '../../../actions/ui';
import * as tablesActions from '../../../actions/tables';
import * as favoritesActions from '../../../actions/favorites';
import * as contextMenuActions from '../../../actions/contextMenu';
import type { Dispatch, Tables, State, IdString, Table, ContextMenuState } from '../../../types';
import { getFiltredTables, getTablesQuantity } from '../../../selectors/tables';

import { getCurrentDBName } from '../../../selectors/tableName';

import {
  TablesSidebar,
  TablesContent,
  TablesContainer,
  TableContent,
  TableIcon,
  MenuSwitcher,
  Pin,
  LoaderContainer,
  TableLoader,
  AnimatedLoader,
  MaskTop,
  MaskBottom,
  MaskShort,
  SearchIcon,
  Filter,
  TablesSearch,
  SideBarFooter,
  CreateTableButton,
  CircleIcon,
  Title,
} from './styled';

type Props = {
  toggleContextMenu: (ContextMenuState) => void,
  fetchTablesRequest: (?IdString) => void,
  setTableNameSearchKey: (?IdString) => void,
  toggleMenu: (boolean) => void,
  fetchTableData: ({ table: Table }) => void,
  selectTable: (?string) => void,
  getTableSchema: (Table) => void,
  tables: Tables,
  currentDBName: string,
  isMenuOpen: boolean,
  isTablesFetched: boolean,
  tablesQuantity: Array<number>,
  currentTable: ?string
};

class Sidebar extends Component {
  props: Props;

  componentDidMount() {
    this.props.fetchTablesRequest();
  }

  handleRightClick = (tableName) => {
    this.props.toggleContextMenu({ selectedElementType: 'table', selectedElementName: tableName });
  }

  fetchTable = (table) => {
    this.props.selectTable(table.tableName);
    if (!table.isFetched) {
      this.props.getTableSchema(table);
      this.props.fetchTableData({ table });
    }
  }

  render() {
    const {
      tables,
      currentDBName,
      isMenuOpen,
      toggleMenu,
      tablesQuantity,
      setTableNameSearchKey,
      currentTable,
      isTablesFetched,
    }: Props = this.props;
    return (
      <TablesSidebar>
        <MenuSwitcher onClick={() => toggleMenu(!isMenuOpen)} id="menuSwitcher">
          {currentDBName}
          <Pin className="fa fa-chevron-right" />
        </MenuSwitcher>
        <TablesContent>
          <LoaderContainer display={!isTablesFetched}>
            {tablesQuantity.map((index) =>
              <TableLoader key={index}>
                <TableIcon className="fa fa-table" />
                <AnimatedLoader>
                  <MaskTop />
                  <MaskShort />
                  <MaskBottom />
                </AnimatedLoader>
              </TableLoader>,
            )}
          </LoaderContainer>
          <TablesContainer display={isTablesFetched}>
            {tables.map((table) =>
              <TableContent
                key={table.tableName}
                onContextMenu={() => this.handleRightClick(table.tableName)}
                active={currentTable === table.tableName}
                onClick={() => this.fetchTable(table)}
              >
                <TableIcon className="fa fa-table" />
                <span title={table.tableName}>
                  {table.tableName}
                </span>
              </TableContent>,
            )}
          </TablesContainer>
        </TablesContent>
        <Filter>
          <SearchIcon className="fa fa-search" />
          <TablesSearch
            onChange={(e) => setTableNameSearchKey(e.target.value)}
            placeholder="Search"
          />
        </Filter>
        <SideBarFooter>
          <CreateTableButton>
            <CircleIcon className="fa fa-plus-circle" />
            <Title>New Table</Title>
          </CreateTableButton>
        </SideBarFooter>
      </TablesSidebar>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch): { [key: string]: Function } {
  return bindActionCreators(
    {
      ...uiActions,
      ...tablesActions,
      ...favoritesActions,
      ...contextMenuActions,
    }, dispatch,
  );
}

function mapStateToProps(state: State) {
  return {
    tables: getFiltredTables({ tables: state.tables }),
    currentDBName: getCurrentDBName({ favorites: state.favorites }),
    isMenuOpen: state.ui.isMenuOpen,
    tablesQuantity: getTablesQuantity({ favorites: state.favorites }),
    currentTable: state.tables.meta.currentTableName,
    isTablesFetched: state.ui.isTablesFetched,
  };
}

const connector: Connector<{}, Props> = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default connector(Sidebar);