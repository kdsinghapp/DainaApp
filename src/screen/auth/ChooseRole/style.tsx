// style.ts
import { Dimensions, StyleSheet } from 'react-native';
import font from '../../../theme/font';
 const { width, height } = Dimensions.get('window');
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 30,
  },
  container: {
    alignItems: 'center',
    padding: 20,
    marginTop: 30,
  },
  image: {
    height: 75,
    width: 167,
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontFamily: font.MonolithRegular,
    textAlign: 'center',
    marginBottom: 30,
    color: '#222',
  },
  touchContainer: {
    marginTop: 12,
    width: '100%',
  },
  option: {
    height: 67,
    borderRadius: 10,
    marginBottom: 18,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // elevation: 4,
    borderWidth: 0.8,
    borderColor: '#e0e0e0',
  },
  optionSelected: {
    backgroundColor: 'black',
    shadowColor: 'black',
    borderColor: 'black',
   },
  optionIcon: {
    height: 35,
    width: 35,
  },
  optionText: {
    fontSize: 14.5,
    color: '#333',
     marginLeft: 16,
    fontFamily: font.MonolithRegular,
  },
  optionTextSelected: {
    color: '#fff',
  },
  bottomButtonContainer: {
    marginHorizontal: 24,
    marginBottom: 25,
  },
  nextButton: {
    backgroundColor: 'black',
    borderRadius: 30,
    height: 55,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },

 });
