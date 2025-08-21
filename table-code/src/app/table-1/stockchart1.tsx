import {
    Table,
    Header,
    HeaderRow,
    Body,
    Row,
    HeaderCell,
    Cell,
} from "@table-library/react-table-library/table";

import { useTheme } from "@table-library/react-table-library/theme";

const nodes = [
    {
        id: "0",
        name: "Operating System",
        deadline: "2020-02-15T00:00:00.000Z",
        type: "SETUP",
        isComplete: true,
        nodes: null,
    },
    {
        id: "1",
        name: "VSCode",
        deadline: "2020-02-17T00:00:00.000Z",
        type: "SETUP",
        isComplete: true,
        nodes: [],
    },
    {
        id: "2",
        name: "JavaScript",
        deadline: "2020-03-28T00:00:00.000Z",
        type: "LEARN",
        isComplete: true,
        nodes: [
            {
                id: "22",
                name: "Data Types",
                deadline: "2020-03-20T00:00:00.000Z",
                type: "LEARN",
                isComplete: true,
                nodes: [
                    {
                        id: "221",
                        name: "Strings",
                        deadline: "2020-03-18T00:00:00.000Z",
                        type: "LEARN",
                        isComplete: true,
                        nodes: null,
                    },
                    {
                        id: "222",
                        name: "Numbers",
                        deadline: "2020-03-19T00:00:00.000Z",
                        type: "LEARN",
                        isComplete: true,
                        nodes: null,
                    },
                ],
            },
            {
                id: "23",
                name: "Objects",
                deadline: "2020-03-22T00:00:00.000Z",
                type: "LEARN",
                isComplete: true,
                nodes: [
                    {
                        id: "231",
                        name: "Object Methods",
                        deadline: "2020-03-20T00:00:00.000Z",
                        type: "LEARN",
                        isComplete: true,
                        nodes: null,
                    },
                    {
                        id: "232",
                        name: "Garbage Collection",
                        deadline: "2020-03-21T00:00:00.000Z",
                        type: "LEARN",
                        isComplete: true,
                        nodes: null,
                    },
                ],
            },
            {
                id: "24",
                name: "Code Style",
                deadline: "2020-03-23T00:00:00.000Z",
                type: "LEARN",
                isComplete: true,
                nodes: [],
            },
        ],
    },
    {
        id: "3",
        name: "React",
        deadline: "2020-04-07T23:00:00.000Z",
        type: "LEARN",
        isComplete: false,
        nodes: [
            {
                id: "31",
                name: "Create React App",
                deadline: "2020-03-31T23:00:00.000Z",
                type: "SETUP",
                isComplete: true,
                nodes: null,
            },
            {
                id: "32",
                name: "JSX",
                deadline: "2020-03-31T23:00:00.000Z",
                type: "LEARN",
                isComplete: true,
                nodes: null,
            },
            {
                id: "33",
                name: "Components",
                deadline: "2020-04-30T23:00:00.000Z",
                type: "LEARN",
                isComplete: false,
                nodes: [],
            },
            {
                id: "34",
                name: "Props",
                deadline: "2020-05-31T23:00:00.000Z",
                type: "LEARN",
                isComplete: false,
                nodes: null,
            },
            {
                id: "35",
                name: "State",
                deadline: "2020-06-30T23:00:00.000Z",
                type: "LEARN",
                isComplete: false,
                nodes: [
                    {
                        id: "351",
                        name: "Remote State",
                        deadline: "2020-07-31T23:00:00.000Z",
                        type: "LEARN",
                        isComplete: true,
                        nodes: [],
                    },
                    {
                        id: "352",
                        name: "Local State",
                        deadline: "2020-07-31T23:00:00.000Z",
                        type: "LEARN",
                        isComplete: false,
                        nodes: [],
                    },
                ],
            },
        ],
    },
    {
        id: "4",
        name: "Git",
        deadline: "2020-05-27T23:00:00.000Z",
        type: "SETUP",
        isComplete: false,
        nodes: [],
    },
    {
        id: "5",
        name: "Node",
        deadline: "2020-06-17T23:00:00.000Z",
        type: "LEARN",
        isComplete: true,
        nodes: [
            {
                id: "51",
                name: "Express",
                deadline: "2020-06-09T23:00:00.000Z",
                type: "LEARN",
                isComplete: false,
                nodes: null,
            },
        ],
    },
    {
        id: "6",
        name: "GraphQL",
        deadline: "2020-07-29T23:00:00.000Z",
        type: "LEARN",
        isComplete: false,
        nodes: [
            {
                id: "61",
                name: "Queries and Mutations",
                deadline: "2020-07-27T23:00:00.000Z",
                type: "LEARN",
                isComplete: false,
                nodes: [
                    {
                        id: "611",
                        name: "Fields",
                        deadline: "2020-07-19T23:00:00.000Z",
                        type: "LEARN",
                        isComplete: false,
                        nodes: null,
                    },
                    {
                        id: "612",
                        name: "Arguments",
                        deadline: "2020-07-20T23:00:00.000Z",
                        type: "LEARN",
                        isComplete: false,
                        nodes: null,
                    },
                    {
                        id: "613",
                        name: "Aliases",
                        deadline: "2020-07-21T23:00:00.000Z",
                        type: "LEARN",
                        isComplete: false,
                        nodes: null,
                    },
                    {
                        id: "614",
                        name: "Fragments",
                        deadline: "2020-07-22T23:00:00.000Z",
                        type: "LEARN",
                        isComplete: false,
                        nodes: [
                            {
                                id: "6141",
                                name: "Inline Fragments",
                                deadline: "2020-07-22T23:00:00.000Z",
                                type: "LEARN",
                                isComplete: false,
                                nodes: null,
                            },
                        ],
                    },
                    {
                        id: "615",
                        name: "Variables",
                        deadline: "2020-07-23T23:00:00.000Z",
                        type: "LEARN",
                        isComplete: false,
                        nodes: null,
                    },
                    {
                        id: "616",
                        name: "Directives",
                        deadline: "2020-07-24T23:00:00.000Z",
                        type: "LEARN",
                        isComplete: false,
                        nodes: null,
                    },
                ],
            },
        ],
    },
];

const THEME = {
    Table: ``,
    Header: ``,
    Body: ``,
    BaseRow: `
    background-color: var(--theme-ui-colors-background);

    &.row-select-selected, &.row-select-single-selected {
      background-color: var(--theme-ui-colors-background-secondary);
      color: var(--theme-ui-colors-text);
    }
  `,
    HeaderRow: `
    font-size: 10px;
    color: var(--theme-ui-colors-text-light);

    .th {
      border-bottom: 1px solid var(--theme-ui-colors-border);
    }
  `,
    Row: `
    font-size: 12px;
    color: var(--theme-ui-colors-text);

    &:not(:last-of-type) .td {
      border-bottom: 1px solid var(--theme-ui-colors-border);
    }

    &:hover {
      color: var(--theme-ui-colors-text-light);
    }
  `,
    BaseCell: `
    border-bottom: 1px solid transparent;
    border-right: 1px solid transparent;

    padding: 8px;
    height: 52px;

    svg {
      fill: var(--theme-ui-colors-text);
    }
  `,
    HeaderCell: ``,
    Cell: ``,
};

const TableOne = () => {
    const data = { nodes };

    const theme = useTheme(THEME);

    return (
        <Table data={data} theme={theme} layout={{ fixedHeader: true }}>
            {(tableList) => (
                <>
                    <Header>
                        <HeaderRow>
                            <HeaderCell>Task</HeaderCell>
                            <HeaderCell>Deadline</HeaderCell>
                            <HeaderCell>Type</HeaderCell>
                            <HeaderCell>Complete</HeaderCell>
                            <HeaderCell>Tasks</HeaderCell>
                        </HeaderRow>
                    </Header>

                    <Body>
                        {tableList.map((item) => (
                            <Row key={item.id} item={item}>
                                <Cell>{item.name}</Cell>
                                <Cell>
                                    {new Date(item.deadline).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                    })}
                                </Cell>
                                <Cell>{item.type}</Cell>
                                <Cell>{item.isComplete.toString()}</Cell>
                                <Cell>{item.nodes ? item.nodes.length : ""}</Cell>
                            </Row>
                        ))}
                    </Body>
                </>
            )}
        </Table>
    );
};

export default TableOne;
