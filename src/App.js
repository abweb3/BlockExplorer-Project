import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import erc20Abi from "./abi";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import TokenTransfers from "./TokenTransfers";
import { GiFrog } from "react-icons/gi";

const pepeTokenAddress = "0x6982508145454ce325ddbe47a25d4ec3d2311933";
const alchemyRpcUrl = process.env.REACT_APP_ALCHEMY_RPC;
function App() {
  const [totalSupply, setTotalSupply] = useState();
  const [balance, setBalance] = useState();
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blockNumber, setBlockNumber] = useState();
  const [gasPrice, setGasPrice] = useState();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    async function fetchTokenData() {
      try {
        setLoading(true);
        setError(null);
        const web3 = createAlchemyWeb3(alchemyRpcUrl);
        const pepeTokenContract = new web3.eth.Contract(erc20Abi, pepeTokenAddress);
        const totalSupply = await pepeTokenContract.methods.totalSupply().call();
        setTotalSupply(totalSupply.toString());

        const blockNumber = await web3.eth.getBlockNumber();
        setBlockNumber(blockNumber);

        const gasPrice = await web3.eth.getGasPrice();
        setGasPrice(gasPrice.toString());

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    }

    fetchTokenData();
  }, []);

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleBalanceCheck = async () => {
    try {
      setLoading(true);
      setError(null);

      const web3 = createAlchemyWeb3(alchemyRpcUrl);
      const pepeTokenContract = new web3.eth.Contract(erc20Abi, pepeTokenAddress);
      const balance = await pepeTokenContract.methods.balanceOf(address).call();
      setBalance(balance.toString());

      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <Container className={`mt-4 ${theme}`} data-theme={theme}>
      <Row>
        <Col>
          <header className="hero">
            <GiFrog size={96} color="green" style={{ marginBottom: "16px" }} />
            <h1 className="hero-heading">PEPSPLORAR SCAN</h1>
          </header>
        </Col>
      </Row>
      <Row>
        <Col>
          <h1 className="token-info-heading">Token Info</h1>
          {loading && <p>Loading...</p>}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && (
            <div className="token-info-card">
              <p>Total Supply: {totalSupply}</p>
              <p>Block Number: {blockNumber}</p>
              <p>Gas Price: {gasPrice}</p>
            </div>
          )}
        </Col>
      </Row>
      <Row className="mt-4 balance-check">
        <Col>
          <h2 className="balance-check-header">Balance Check</h2>
          <Form className="balance-check-form">
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Row>
                <Col md={12}>
                  <Form.Control
                    type="text"
                    placeholder="Enter address"
                    value={address}
                    onChange={handleAddressChange}
                    className="balance-check-input"
                  />
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Button
                    variant="primary"
                    onClick={handleBalanceCheck}
                    className="balance-check-button"
                  >
                    Check Balance
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
          {loading && <p>Loading...</p>}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && balance && <p>Balance: {balance}</p>}
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <h2>Token Transfers</h2>
          <TokenTransfers />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <footer className="footer">
            <p>Made with love from a Web3 Builder</p>
            <p>Disclaimer: This is a sample application.</p>
          </footer>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
