export default function SegmentTable({
  data,
}) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Segment ID</th>
            <th>Sand Blasting</th>
            <th>Grinding</th>
            <th>Loading</th>
            <th>Steel Bending</th>
            <th>Progress</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => {
            const completed = [
              item.works?.sandBlasting
                ?.completed,
              item.works?.grinding
                ?.completed,
              item.works?.loading
                ?.completed,
              item.works?.steelBending
                ?.completed,
            ].filter(Boolean).length;

            const percent =
              (completed / 4) * 100;

            return (
              <tr key={item._id}>
                <td>
                  {item.segmentId}
                </td>

                <td>
                  {item.works
                    ?.sandBlasting
                    ?.completed
                    ? `✓ (${item.works.sandBlasting.month})`
                    : "-"}
                </td>

                <td>
                  {item.works?.grinding
                    ?.completed
                    ? `✓ (${item.works.grinding.month})`
                    : "-"}
                </td>

                <td>
                  {item.works?.loading
                    ?.completed
                    ? `✓ (${item.works.loading.month})`
                    : "-"}
                </td>

                <td>
                  {item.works
                    ?.steelBending
                    ?.completed
                    ? `✓ (${item.works.steelBending.month})`
                    : "-"}
                </td>

                <td>{percent}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}