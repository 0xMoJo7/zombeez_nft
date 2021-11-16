import {useState, useContext, useEffect} from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Grid,
  Image,
  Button
} from '@chakra-ui/react';
import '@fontsource/arbutus'
import theme from "./theme"
import hg from './assets/hive_cropped.gif'
import { ethers } from 'ethers'
import { Web3Context } from "./web3";
import whitelist from './merkle/whitelist'
import smartContract from "./artifacts/contracts/Zombeez.sol/Zombeez.json";
const { MerkleTree } = require("merkletreejs");
const keccak256 = require('keccak256')

function App() {
  const { account, connectWeb3, provider } = useContext(Web3Context)
  const [feedback, setFeedback] = useState("Welcome to Zombeez, a collection of 8335 pixelated spooky beez!");
  const [whitelisted, setWhitelisted] = useState()

  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"
  const contract = new ethers.Contract(contractAddress, smartContract.abi, provider.getSigner())

  // Checking Merkle if address is eligible
  const merkle = async () => {
    const buf2hex = x => '0x' + x.toString('hex')
    const leaves = whitelist.map(x => keccak256(x))
    const tree = new MerkleTree(leaves, keccak256);
    const leaf = keccak256(account)
    const hexProof = tree.getProof(leaf).map(x => buf2hex(x.data))
    const positions = tree.getProof(leaf).map(x => x.position === 'right' ? 1 : 0)
    contract.functions.verifyWhitelist(hexProof, positions)
    .then((values) => {
      if (values[0] === true) {
        setWhitelisted(true)
      }
    })
    .catch((error) => {
       console.log(error)
    })
  }

  // Once they are logged in decide if they are Whitelisted or not
  useEffect(() => {
    if (account != null) {
        merkle(); 
    }
  }, [account])

  // Mint function for holders of said token
  const mintForTokenHolders = () => {
    if (whitelisted) {
      setFeedback("Minting your free NFT...")
    } else {
      setFeedback("You arent't on the whitelist")
      return;
    }
    // contract.functions.mintForTokenHolder(1, hexProof, positions)
    //   .once("error", (err) => {
    //     console.log(err);
    //     setFeedback(
    //       "Sorry, something went wrong please try again later or contact support"
    //     );
    //   })
    //   .then((receipt) => {
    //     setFeedback("You now own a Zombee! go visit Opensea.io to view it.");
    //   });
  };

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="l" backgroundColor="black">
        <Grid minH="100vh" p={3}>
          <VStack spacing={50}>
            <Image src={hg} htmlHeight="600" htmlWidth="700"/>
            {account == null ? (
            <Button onClick={connectWeb3}>Connect to Metamask</Button>
              ) : (
                <>
              <Button width="35%"
                onClick={mintForTokenHolders}
              >Claim Free Zombee! (Dizzy Dragon and CryptoToadz only)</Button>
              <Button width="20%" 
                onClick={mintForTokenHolders}
              >Mint 1 Zombee for .03 ETH</Button>
                </>
              )}
          <Text>{feedback}</Text>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
