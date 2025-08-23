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

interface NodeType {
    id: string;
    name: string;
    deadline: string;
    type: string;
    isComplete: boolean;
    nodes: NodeType[] | null;
}

const nodes: NodeType[] = [
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
];

const THEME = {
    Table: `
        --data-table-library_grid-template-columns:  200px repeat(5, minmax(0, 1fr));
    `,
};

const TableOne = () => {
    const data = { nodes };
    const theme = useTheme(THEME);

    return (
        <Table data={data} theme={theme} layout={{ fixedHeader: true }}>
            {(tableList: NodeType[]) => (
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
                        {tableList.map((item: NodeType) => (
                            <Row key={item.id} item={item}>
                                <Cell>{item.name}</Cell>
                                <Cell>
                                    {item.deadline
                                        ? new Date(item.deadline).toLocaleDateString(
                                              "en-US",
                                              {
                                                  year: "numeric",
                                                  month: "2-digit",
                                                  day: "2-digit",
                                              }
                                          )
                                        : ""}
                                </Cell>
                                <Cell>{item.type}</Cell>
                                <Cell>{item.isComplete.toString()}</Cell>
                                <Cell>{item.nodes?.length || 0}</Cell>
                            </Row>
                        ))}
                    </Body>
                </>
            )}
        </Table>
    );
};

export default TableOne;
