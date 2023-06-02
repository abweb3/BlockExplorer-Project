import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import "./blockexplorer.css";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import erc20Abi from "./abi";

function TokenTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10); // Number of transfers per page

  useEffect(() => {
    async function fetchTransfers() {
      try {
        setLoading(true);
        setError(null);
        const alchemyRpcUrl = process.env.REACT_APP_ALCHEMY_RPC;
        const web3 = createAlchemyWeb3(alchemyRpcUrl);
        const pepeTokenAddress = "0x6982508145454ce325ddbe47a25d4ec3d2311933";
        const pepeTokenContract = new web3.eth.Contract(
          erc20Abi,
          pepeTokenAddress
        );

        const latestBlockNumber = await web3.eth.getBlockNumber();
        const fromBlock = Math.max(0, latestBlockNumber - 2000); // Fetch events from the past 2000 blocks
        const toBlock = "latest";

        const transferEvents = await pepeTokenContract.getPastEvents(
          "Transfer",
          {
            fromBlock: web3.utils.toHex(fromBlock),
            toBlock: web3.utils.toHex(toBlock),
          }
        );

        const transfers = transferEvents.map((event) => ({
          id: event.id,
          from: event.returnValues.from,
          to: event.returnValues.to,
          amount: event.returnValues.value,
        }));

        setTransfers(transfers);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    }

    fetchTransfers();
  }, []);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  // Calculate the range of transfers to display based on the current page
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  return (
    <div className="token-transfers">
      <h3>Latest Token Transfers</h3>
      {loading && <p>Loading transfers...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && transfers.length === 0 && (
        <p>No transfers found.</p>
      )}
      {!loading && !error && transfers.length > 0 && (
        <React.Fragment>
          <ListGroup>
            {transfers.slice(startIndex, endIndex).map((transfer) => (
              <ListGroup.Item className="transfer-item" key={transfer.id}>
                <div>
                  <strong>From:</strong> {transfer.from}
                </div>
                <div>
                  <strong>To:</strong> {transfer.to}
                </div>
                <div>
                  <strong>Amount:</strong> {transfer.amount}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={endIndex >= transfers.length}
            >
              Next
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default TokenTransfers;
