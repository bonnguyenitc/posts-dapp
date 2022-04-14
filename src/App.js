import "./App.css";
import Posts from "./artifacts/contracts/Posts.sol/Posts.json";
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";

const postsAddr = "0x38a024C0b412B9d1db8BC398140D00F5Af3093D4";

function App() {
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const initialRef = useRef();

  async function requestAccount() {
    if (typeof window.ethereum !== "undefined") {
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(account || "");
    }
  }

  useEffect(() => {
    requestAccount();
  }, []);

  const getBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const bl = await provider.getBalance(account);
    setBalance(ethers.utils.formatEther(bl));
  };

  useEffect(() => {
    if (account) {
      getBalance();
      fetchPosts();
    }
  }, [account]);

  const handlePost = async () => {
    if (typeof window.ethereum !== "undefined") {
      if (!content || !account) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(postsAddr, Posts.abi, signer);
      const transaction = await contract.addPost(content);
      await transaction.wait();
      getBalance();
      fetchPosts();
      onClose();
    }
  };

  const fetchPosts = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(postsAddr, Posts.abi, provider);
      try {
        const data = await contract.getPostByAddress();
        setPosts(data);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  };

  const upVote = async (index) => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(postsAddr, Posts.abi, signer);
        const transaction = await contract.upVotePost(index);
        await transaction.wait();
        getBalance();
        fetchPosts();
      }
    } catch (error) {
      console.log("upVote error", error);
    }
  };
  const downVote = async (index) => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(postsAddr, Posts.abi, signer);
        const transaction = await contract.downVotePost(index);
        await transaction.wait();
        getBalance();
        fetchPosts();
      }
    } catch (error) {
      console.log("downVote error", error);
    }
  };

  const onChangeText = (evt) => setContent(evt.target.value);

  return (
    <VStack w="100vw" h="100vh" alignItems={"center"}>
      <Flex
        w="100%"
        h={50}
        bg="green.300"
        justifyContent="end"
        alignItems="center"
        pr={"2"}
      >
        {!!account && <Text color={"black"}>{account}</Text>}
        <Box w={"4"} />
        {!!balance && <Text color={"black"}>{Math.round(balance)} eth</Text>}
        <Box w={"4"} />
        {!account && <Button>Connect wallet</Button>}
      </Flex>
      <Box w="xl" h="100%" bg="white">
        <Button colorScheme="orange" color={"white"} mt={"4"} onClick={onOpen}>
          Create post now
        </Button>
        <VStack mt={"8"} alignItems="flex-start">
          {posts?.map((post, index) => (
            <Flex
              key={post?.id?.toString()}
              w="100%"
              justifyContent={"space-between"}
              p="4"
              boxShadow={"md"}
              borderRadius="md"
              borderWidth={1}
              borderColor="green.300"
            >
              <Box>
                <Text>{post?.content}</Text>
              </Box>
              <VStack>
                <Button
                  colorScheme="orange"
                  color={"white"}
                  onClick={() => upVote(index)}
                >
                  <TriangleUpIcon mr={"4"} />
                  {post?.upVotedAmount?.toString()}
                </Button>
                <Button
                  colorScheme="orange"
                  color={"white"}
                  onClick={() => downVote(index)}
                >
                  <TriangleDownIcon mr={"4"} />
                  {post?.downVoteAmount?.toString()}
                </Button>
              </VStack>
            </Flex>
          ))}
        </VStack>
      </Box>
      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>What's your think</FormLabel>
              <Input
                name="content"
                placeholder="umm ..."
                onChange={onChangeText}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="orange" mr={3} onClick={handlePost}>
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

export default App;
