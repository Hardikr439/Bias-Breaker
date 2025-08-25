import pandas as pd
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from tools.MITweet.predict_relevence import TweetPredictor as RelevancePredictor
from tools.MITweet.predict_ideology import RobertaTweetPredictor, args as ideology_args

def run_relevance_prediction(tweets):
    # Prepare DataFrame
    df = pd.DataFrame(tweets)
    # Apply tweet normalization
    from tools.MITweet.TweetNormalizer import normalizeTweet
    df['Content'] = df['Content'].apply(normalizeTweet)
    predictor = RelevancePredictor(
        model_path=r"C:\Learn\IPD\backend\best_relevence_model.pth",
        model_name="vinai/bertweet-base",
        max_seq_length=128
    )
    predictions, probabilities, metrics = predictor.predict(df['Content'].tolist(), batch_size=32)
    # Add predictions to DataFrame
    for i in range(predictions.shape[1]):
        df[f'label_{i}'] = predictions[:, i]
    df['max_confidence'] = metrics['max_confidence']
    df.to_csv(r"C:\Learn\IPD\backend\server\tempdata\tempPred.csv", index=False, encoding='utf-8')
    return df

def run_ideology_prediction(df):
    # Apply tweet normalization
    from tools.MITweet.TweetNormalizer import normalizeTweet
    df['Content'] = df['Content'].apply(normalizeTweet)
    # Find the indicator (label) with the most 1s across all tweets
    label_cols = [col for col in df.columns if col.startswith('label_')]
    label_sums = df[label_cols].sum()
    majority_indicator_idx = int(label_sums.idxmax().split('_')[1])
    majority_label_col = f'label_{majority_indicator_idx}'
    # Only process tweets where the majority indicator is 1
    df_to_predict = df[df[majority_label_col] == 1].copy()
    # indicators file path
    indicators_file = open('C:/Learn/IPD/backend/tools/MITweet/data/random_split/Indicators.txt', encoding='utf-8')
    indicators = [' '.join(line.strip('\n').strip().split(' ')[:ideology_args.indicator_num]) for line in indicators_file]
    if ideology_args.sep_ind:
        indicators = [ind.replace(' ', '</s> ') for ind in indicators]
    predictor = RobertaTweetPredictor(
        model_path="C:/Learn/IPD/backend/best_model.pth",
        args=ideology_args
    )
    tweets = df_to_predict['Content'].tolist()
    # Only predict for the majority indicator
    predictions, probabilities, _ = predictor.predict_batch(tweets, indicators=[indicators[majority_indicator_idx]], batch_size=32)
    # Set ideology column for the majority indicator
    col_pred = predictions[0].tolist()
    out_col = f'I{majority_indicator_idx}'
    df_to_predict[out_col] = col_pred
    # Assign leaning only for tweets where the majority indicator is 1
    def get_leaning(row):
        if row[majority_label_col] == 1:
            val = row.get(out_col, -1)
            if val == 0:
                return 'left'
            elif val == 1:
                return 'centre'
            elif val == 2:
                return 'right'
        return ''
    # Update the main df with ideology and leaning only for those rows
    df.loc[df_to_predict.index, out_col] = df_to_predict[out_col]
    df['leaning'] = df.apply(get_leaning, axis=1)
    # Remove any old leaning columns
    cols_to_drop = [f'leaning_{i}' for i in range(12)]
    df = df.drop(columns=[col for col in cols_to_drop if col in df.columns])
    return df
