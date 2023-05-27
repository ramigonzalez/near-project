const CONTRACT_ADDRESS = "0x3BA20f8E0CedEB01a4799fEaECFa8ee9B70b61b4";
const CONTRACT_ABI = fetch(
  "https://gateway.pinata.cloud/ipfs/QmPeGQSodi657ehGZZkbZLBDsVkaFbjTskmbjabfvDYYmU?_gl=1*472nt1*rs_ga*MTc1ODYwMDQ1NC4xNjg1MTUxODAy*rs_ga_5RMPXG14TE*MTY4NTE1NTI5OC4yLjEuMTY4NTE1NTUzOC41OS4wLjA."
);

if (!CONTRACT_ABI.ok) {
  return "Loading";
}

State.init({
  userAnswers: [],
  alreadyHasNFT: false,
  isLastQuestion: false,
  actualQuestion: 1,
  actualAnswer: "a",
});

const answersByQuestion = (question) => {
  return question.answers.map((val, index) => (
    <option key={index} value={val.id}>
      {val.answer}
    </option>
  ));
};

const changeSelectedOption = ({ target }) => {
  State.update({
    actualAnswer: target.value,
  });
};
const nextAnswer = () => {
  console.log(state.actualQuestion);
  if (state.actualAnswer === "") return console.log("Answer cannot be empty");
  State.update({
    actualQuestion: state.actualQuestion + 1,
    userAnswers: [
      ...state.userAnswers,
      {
        id: state.actualQuestion,
        answer: state.actualAnswer,
      },
    ],
    isLastQuestion: state.actualQuestion + 1 === 4,
  });
};

const previousAnswer = () => {
  state.userAnswers.pop();
  State.update({ userAnswers: state.userAnswers });
  if (state.actualQuestion > 1) {
    State.update({ actualQuestion: state.actualQuestion - 1 });
  }
};

const submitAnswers = () => {
  // make the call to the server to send answers
  // state.userAnswers
  console.log("isLastQuestion", state.isLastQuestion);
  console.log("CONTRACT_ADDRESS", CONTRACT_ADDRESS);
  console.log("CONTRACT_ABI", CONTRACT_ABI.body.sourceName);
  console.log("signer", Ethers.provider().getSigner());
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI.body.abi,
    Ethers.provider().getSigner()
  );

  contract
    .setName(JSON.stringify(state.userAnswers))
    .then((transactionHash) => {
      console.log(
        "transactionHash is " + JSON.stringify(JSON.parse(transactionHash))
      );

      console.log("get name before");
      contract.getName().then((res) => {
        State.update({ nftMetadata: res, alreadyHasNFT: true });
      });
      console.log("get name after");
    });
};

const cancel = () => {
  State.update({
    actualQuestion: state.actualQuestion - 1,
    isLastQuestion: false,
  });
};

if (state.sender === undefined) {
  const accounts = Ethers.send("eth_requestAccounts", []);
  if (accounts.length) {
    State.update({ sender: accounts[0] });
  }
}

return (
  <>
    <div class="container border border-info p-3 text-center">
      <Web3Connect
        className="LidoStakeFormSubmitContainer"
        connectLabel="Connect with Web3"
      />
    </div>
    {!!state.sender && (
      <>
        {!state.alreadyHasNFT ? (
          <>
            <label>{JSON.stringify(state.userAnswers)}</label>
            <label>{state.actualAnswer}</label>
            <div class="container border border-info p-3 text-center">
              <h4>Hello {state.sender}</h4>
            </div>

            {!state.isLastQuestion ? (
              <>
                <div class="container border border-info p-3">
                  <div class="container border border-info p-3 text-center">
                    <p> Question: {state.actualQuestion} </p>
                  </div>
                  <div class="p-3">
                    <p>{props.questions[state.actualQuestion].question}</p>

                    <select
                      name={state.actualQuestion}
                      id={state.actualQuestion}
                      onChange={changeSelectedOption}
                    >
                      {answersByQuestion(props.questions[state.actualQuestion])}
                    </select>
                  </div>
                </div>
                <div class="container border border-info p-3 text-center">
                  <button onClick={previousAnswer}>Previous</button>
                  <button onClick={nextAnswer}>Next</button>
                </div>
              </>
            ) : (
              <div class="container border border-info p-3 text-center">
                <button onClick={cancel}>Cancel</button>
                <button onClick={submitAnswers}>Submit</button>
              </div>
            )}
          </>
        ) : (
          <div>
            <p>THIS IS YOUR NFT</p>
            <p>{state.nftMetadata}</p>
          </div>
        )}
      </>
    )}
  </>
);
